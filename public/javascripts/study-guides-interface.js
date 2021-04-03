function getSheetHtml(sheet, nClass) {
    let html = `
        <td class='study-img ${nClass}' >
            <a target="_blank" href='${sheet.url}'>
            <p class='study-txt ${nClass}'> 
                ${sheet.title}
    `;

    for (let option of [ 'subject', 'teacher', 'author' ]) {
        if (sheet[option]) {
            // html += `<span class='small'>${capitalize(option)}: ${sheet[option]}</span>`;
            html += `<span class='small'>${sheet[option]}</span>`;
        }

    }

    html += `
        </p>
        </a>
    </td>`;


    return html;

}

function getSheetsHtml(sheets, nClass) {
    let html = '';
    let needsClose = false;
    let i = 0;
    for (let i = 0; i < sheets.length; ++i) {
        if (i % SHEETS_PER_ROW == 0) {
            html += needsClose ? "</tr>" : "<tr>";
            needsClose = !needsClose;
        }

        let sheet = sheets[i];

        html += getSheetHtml(sheet, nClass);
    }
    return html;
}

function consumeHtml(html) {
    document.getElementById("sheets-table").innerHTML = html;
}

function getDefaultHtml(nClass) {
    return `<tr><td class='${nClass}'><p style='padding-top: 2vw;'>No study guides found 😢</p></td></tr>`;
}
