import zipfile
import json
import re

with open('filter_words.txt', 'r') as f:
    words = f.readlines()
words = [S.replace('\n','') for S in words]

def is_valid_key(key):
    if '\t' in key:
        return False

    if '' in key:
        return False

    if len(key)>2 and key.isupper():
        return False

    for s in words:
        if s in key:
            return False

    # Check if the key is a date (assuming format YYYY-MM-DD)
    date_pattern = re.compile(r'.*(19|20)\d{2}')
    if date_pattern.match(key):
        return False

    date_pattern = re.compile(r'.*\d{2}\.\d{2}\.\d{4}')
    if date_pattern.match(key):
        return False

    # Check if the key is a long number (more than 2 digits)
    if key.isdigit() and len(key) > 2:
        return False

    return True

def filter_json_object(json_obj, max):
    if isinstance(json_obj, dict):
        if json_obj['.count'] < 50:
            return {}
        if max==0:
            return {}
        return {k: filter_json_object(v, max-1) for k, v in json_obj.items() if is_valid_key(k)}
    elif isinstance(json_obj, list):
        return [filter_json_object(item) for item in json_obj]
    else:
        return json_obj

def main():
    input_zip_file = 'trie2_ALL_MAX8_MINC20.zip'
    output_zip_file = 'filtered_trie2_ALL_MAX8_MINC20.zip'
    json_file_name = 'trie2_ALL_MAX8_MINC20.json'  # Assuming the JSON file inside the ZIP is named 'data.json'

    # Open the input ZIP file and read the JSON content
    with zipfile.ZipFile(input_zip_file, 'r') as zip_ref:
        with zip_ref.open(json_file_name) as json_file:
            json_data = json.load(json_file)

    # Filter the JSON object
    filtered_json_data = filter_json_object(json_data, 5)

    # Save the filtered JSON object to a new ZIP file
    with zipfile.ZipFile(output_zip_file, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zip_ref:
        with zip_ref.open(json_file_name, 'w') as json_file:
            json_file.write(json.dumps(filtered_json_data, ensure_ascii=False).encode('utf-8'))

    print(f'Filtered JSON data saved to {output_zip_file}')

if __name__ == '__main__':
    main()