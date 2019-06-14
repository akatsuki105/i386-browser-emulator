let consoleInput = document.getElementById('consoleInput');
let inputValue = 0;
consoleInput.addEventListener("change", event => {
    inputValue = (event.target.value).charCodeAt(0);
}, false);

export function io_in8(address) {
    switch (address) {
        case 0x03f8:
            return inputValue;
        default:
            return 0;
    }
}

export function io_out8(address, value) {
    switch (address) {
        case 0x03f8:
            return outputText(String.fromCharCode(value));
        default:
            return 0;
    }
}

export function resetTextBox() {
    document.getElementById('consoleOutput').innerHTML = "";
}

export function outputText(str) {
    document.getElementById('consoleOutput').append(`\n${str}\n`);
}
