
function generateAndDownloadDocx(parss){


    AFTER = 0; //200;

    // Create a new document
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "Описание: ",
                            bold: true,
                            size: 24
                        }),
                        new docx.TextRun({
                            text: parss[0][0],
                            bold: false,
                            size: 24
                        })
                    ],
                    spacing: {
                        after: AFTER
                    }
                })].extend(parss[0].slice(1).map(function(p){return new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: p,//"This is a sample document generated using JavaScript.",
                            size: 24
                        })
                    ],
                    spacing: {
                        after: AFTER
                    }
                })})).extend([
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Заключение: " + parss[1][0],
                                bold: true,
                                size: 24
                            })
                        ],
                        spacing: {
                            before: 200,
                            after: AFTER
                        }
                    })
                ]).extend(
                    parss[1].slice(1).map(function(p){return new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: p,//"This is a sample document generated using JavaScript.",
                                    bold: true,
                                    size: 24
                                })
                            ],
                            spacing: {
                                after: AFTER
                            }
                        })
                    })
                ).extend([
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "Сохранено: " + new Date().toLocaleString(),
                            italics: true
                        })
                    ]
                })
                ])
        }]
    });


    // Show modal and handle file download
    _MODAL = createModal();
    _MODAL.firstElementChild.style.display = 'flex';

    const downloadFile = (filename) => {
        // Add .docx extension if not present
        const finalFilename = filename.toLowerCase().endsWith('.docx') 
            ? filename 
            : filename + '.docx';

        docx.Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        });
    };

    // Modal event listeners
    const handleSave = (e) => {
        const filenameInput = document.getElementById('filename');
        const filename = filenameInput.value.trim();
        if (filename) {
            downloadFile(filename);
            _MODAL.style.display = 'none';
            document.body.removeChild(_MODAL);
        }
        e.stopPropagation();
    };

    // Add event listeners
    document.getElementById('modal-save').addEventListener('click', handleSave);
    document.getElementById('filename').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    });
};



// Create modal HTML
const createModal = () => {
    const def_fname = 'Заключение_'+date2str(new Date)+'_'+date2timestr(new Date,1,'-')

    const modal = document.createElement('div');
    modal.innerHTML = `
        <div id="filename-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background-color: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; justify-content: center; align-items: center;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); 
                width: 90%; max-width: 400px;">
                <h4 style="margin: 0 0 20px 0; color: #333;">Сохранить как .docx </h4>
                <div style="margin-bottom: 20px;">
                    <label for="filename" style="display: block; margin-bottom: 8px; color: #555;">Введите имя файла:</label>
                    <input type="text" id="filename" value="${def_fname}"
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    <span style="display: block; color: #666; margin-top: 4px; font-size: 12px;">.docx будет добавлено автоматически</span>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="modal-cancel" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; 
                        cursor: pointer; color: #666;">Отмена</button>
                    <button id="modal-save" style="padding: 8px 16px; background: #2E74B5; color: white; border: none; border-radius: 4px; 
                        cursor: pointer;">Сохранить</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);


    const handleCancel = (e) => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
        e.stopPropagation();
    };
    modal.getElementsByClassName('modal-content')[0].addEventListener('click', (e) => {e.stopPropagation()});

    modal.addEventListener('click', handleCancel);

    document.getElementById('modal-cancel').addEventListener('click', handleCancel);


    return modal;
};
