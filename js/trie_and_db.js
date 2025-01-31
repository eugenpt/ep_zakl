// @ts-check

/**
 * @typedef {Object} TrieNode
 * @property {number} ['.count'] - The count for this node if it represents a complete phrase
 * @property {Object.<string, TrieNode>} [children] - Child nodes
 */

/**
 * @typedef {Object} PhraseCount
 * @property {string} phrase
 * @property {number} count
 */

/**
 * Modern Trie implementation with efficient storage and retrieval
 */
class TrieManager {
  /** @type {IDBDatabase} */
  #db;
  
  /** @type {string} */
  static DB_NAME = 'phraseTrieDB';
  
  /** @type {number} */
  static DB_VERSION = 3;
  
  /** @type {string} */
  static STORE_NAME = 'phrases';
  
  /** @type {number} */
  static BATCH_SIZE = 1000;

  /** @type {AbortController|null} */
  #abortController = null;

  /**
   * Initialize the TrieManager
   */
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.#db = await this.#openDatabase();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize TrieManager:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Open the IndexedDB database with proper schema
   * @returns {Promise<IDBDatabase>}
   */
  #openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(TrieManager.DB_NAME, TrieManager.DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open database'));

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Delete old object store if it exists
        if (db.objectStoreNames.contains(TrieManager.STORE_NAME)) {
          db.deleteObjectStore(TrieManager.STORE_NAME);
        }

        // Create new object store with indexes
        const store = db.createObjectStore(TrieManager.STORE_NAME, { keyPath: 'phrase' });
        // store.createIndex('count', 'count', { unique: false });
        // store.createIndex('length', 'length', { unique: false });
        store.createIndex('phraseLower', 'phraseLower', { unique: false });
        // Add compound index for prefix+count queries
        // store.createIndex('phrase_count', ['phrase', 'count'], { unique: false });
        // Add compound index for efficient case-insensitive prefix search
        // store.createIndex('phrase_lower_count', ['phraseLower', 'count'], { unique: false });
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Load trie data from a ZIP file URL
   * @param {string} url - URL to the ZIP file containing trie data
   * @returns {Promise<void>}
   */
  async loadFromZip(url) {
    if (!this.isInitialized) {
      throw new Error('TrieManager not initialized');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch ZIP file');

      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Assume single JSON file in ZIP
      const jsonFile = Object.values(zip.files)[0];
      if (!jsonFile) throw new Error('No files found in ZIP');

      const jsonContent = await jsonFile.async('string');
      const trieData = JSON.parse(jsonContent);
      
      await this.#loadTrieData(trieData);
    } catch (error) {
      console.error('Failed to load ZIP file:', error);
      throw error;
    }
  }

  /**
   * Load trie data into IndexedDB efficiently
   * @param {TrieNode} trieData 
   * @returns {Promise<void>}
   */
  async #loadTrieData(trieData) {
    const phrases = [];
    
    // Flatten trie into array of phrases with counts
    this.#traverseTrie(trieData, '', phrases);
    
    // Sort phrases by count (descending) for optimal indexing
    phrases.sort((a, b) => b.count - a.count);
    
    // Load phrases in batches
    for (let i = 0; i < phrases.length; i += TrieManager.BATCH_SIZE) {
      const batch = phrases.slice(i, i + TrieManager.BATCH_SIZE);
      await this.#storeBatch(batch);
    }
  }

  /**
   * Store a batch of phrases in IndexedDB
   * @param {PhraseCount[]} batch 
   * @returns {Promise<void>}
   */
  async #storeBatch(batch) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(TrieManager.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(TrieManager.STORE_NAME);

      batch.forEach(({ phrase, count }) => {
        store.put({
          phrase,
          phraseLower: phrase.toLowerCase(), // Store lowercase version for indexing
          count,
          length: phrase.split(' ').length
        });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Batch storage failed'));
    });
  }

  /**
   * Traverse trie and collect phrases with counts
   * @param {TrieNode} node 
   * @param {string} currentPhrase 
   * @param {PhraseCount[]} phrases 
   */
  #traverseTrie(node, currentPhrase, phrases) {
    if (node['.count']) {
      phrases.push({
        phrase: currentPhrase.trim(),
        count: node['.count']
      });
    }

    for (const [word, childNode] of Object.entries(node)) {
      if (word !== '.count') {
        this.#traverseTrie(
          childNode,
          currentPhrase + (currentPhrase ? ' ' : '') + word,
          phrases
        );
      }
    }
  }

  /**
   * Get top phrases by count
   * @param {Object} options Query options
   * @param {number} [options.limit=100] Maximum number of results
   * @param {number} [options.minLength] Minimum phrase length (in words)
   * @param {number} [options.maxLength] Maximum phrase length (in words)
   * @returns {Promise<PhraseCount[]>}
   */
  async getTopPhrases({ limit = 100, minLength, maxLength } = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(TrieManager.STORE_NAME, 'readonly');
      const store = transaction.objectStore(TrieManager.STORE_NAME);
      const results = [];

      // Use count index for efficient sorting
      const request = store.index('count').openCursor(null, 'prev');

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor && results.length < limit) {
          const { phrase, count, length } = cursor.value;
          
          // Apply length filters if specified
          if ((!minLength || length >= minLength) && 
              (!maxLength || length <= maxLength)) {
            results.push({ phrase, count });
          }
          
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(new Error('Failed to retrieve phrases'));
    });
  }

  abort() {
    if (this.#abortController) {
      this.#abortController.abort();
      console.log('Aborting ongoing operation.');
    }
  }

  /**
   * Search for phrases that start with the given prefix, properly sorted by count
   * @param {string} searchText 
   * @param {number} [limit=50] 
   * @returns {Promise<PhraseCount[]>}
   */
  async searchPhrases(searchText, limit = 50) {
    this.#abortController = new AbortController();
    const signal = this.#abortController.signal;

    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(TrieManager.STORE_NAME, 'readonly');
      const store = transaction.objectStore(TrieManager.STORE_NAME);
      const results = [];
      
      const searchLower = searchText.toLowerCase();
      const upperBound = searchLower.slice(0, -1) + 
        String.fromCharCode(searchLower.charCodeAt(searchLower.length - 1) + 1);

      // First, collect all matching phrases
      const range = IDBKeyRange.bound(searchLower, upperBound, false, true);
      const request = store.index('phraseLower').openCursor(range);

      request.onsuccess = (event) => {
        if (signal.aborted) {
          console.log('Search aborted.');
          reject(new Error('Search aborted.'));
          return;
        }

        const cursor = event.target.result;
        if (cursor) {
            results.push({
            phrase: cursor.value.phrase,
            count: cursor.value.count
          });
          cursor.continue();
        } else {
          // After collecting all results, sort by count
          results.sort((a, b) => b.count - a.count);
          // Return only the requested number of results
          console.log('resolving ('+limit+' out of '+results.length+' total for prefix='+searchText)
          resolve(results.slice(0, limit));
        }
      };

      request.onerror = () => reject(new Error('Search failed'));
    });
  }


  /**
   * Search phrases for all prefixes concurrently, aggregate results, and include pre_prefix logic.
   * @param {string} text - The input text to generate prefixes.
   * @param {string} pre_prefix - The prefix to add before the resulting phrases.
   * @param {number} [limit=50] - Maximum number of results to retrieve for each prefix.
   * @returns {Promise<PhraseCount[]>} Aggregated and sorted results.
   */
  async searchPhrasesForAllPrefixes(text, limit = 50, order_by_both_rel_word_log_weight=2, add_log10_weight_fun=(x)=>0) {
    const words = text.split(' ');
    const resultsMap = new Map(); // To store results for all prefixes
    const promises = [];

    // Generate promises for each prefix
    for (let i = Math.max(0, words.length - 5); i < words.length; i++) {
      const output_prefix = words.slice(0, i).join(' ') + (i>0 ? ' ' : ''); // Build the prefix to add to each result
      const prefix = words.slice(i).join(' '); // The actual prefix for searching
      if (prefix.length === 0) break;

      // Create a promise for each prefix search
      const promise = this.searchPhrases(prefix, limit).then((results) => {
        // Merge results from each prefix
        results.forEach((result) => {
          const fullPhrase = output_prefix + result.phrase; // Combine the output_prefix with the result phrase
          if (resultsMap.has(fullPhrase)) {
            resultsMap.set(fullPhrase, [words.length-i, resultsMap.get(fullPhrase)[1] + result.count]);
          } else {
            resultsMap.set(fullPhrase, [words.length-i, result.count]);
          }
        });
      });
      promises.push(promise);
    }

    // Wait for all search promises to resolve
    await Promise.all(promises);

    // Convert resultsMap to array and sort by count (descending)
    const sortedResults = Array.from(resultsMap.entries()).map(([phrase, WCnC]) => ({ phrase, count:WCnC[1], n_words:WCnC[0] }));

    // Sort results by count
    
    function sorting_fun(a){
      return Math.log10(a.count) + order_by_both_rel_word_log_weight * a.n_words + add_log10_weight_fun(a);
    }
    sortedResults.sort((a, b) => sorting_fun(b) - sorting_fun(a));

    // Return the top `limit` results
    return sortedResults.slice(0, limit);
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.#db) {
      this.#db.close();
      this.isInitialized = false;
    }
  }

  /**
   * Delete the entire database
   * @returns {Promise<void>}
   */
  static async deleteDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(TrieManager.DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete database'));
    });
  }
}

// Usage example
async function example() {
  try {
    // Initialize manager
    const manager = new TrieManager();
    await manager.initialize();

    // Load data from ZIP file
    await manager.loadFromZip('filtered_trie2_ALL_MAX8_MINC20.zip');

    // Get top 10 phrases with length between 2 and 4 words
    const topPhrases = await manager.getTopPhrases({
      limit: 10,
      minLength: 2,
      maxLength: 4
    });
    console.log('Top phrases:', topPhrases);

    // Search for phrases starting with "example"
    const searchResults = await manager.searchPhrases('example', 5);
    console.log('Search results:', searchResults);

    // Clean up
    await manager.close();
  } catch (error) {
    console.error('Error:', error);
  }
}