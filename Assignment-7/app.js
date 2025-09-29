let is24hour = true;
 
const clock = document.getElementById('clock');
const switcher = document.getElementById('switcher');
function updateClock() {
    const time = new Date();
    let hours = String(time.getHours());
    const minutes = String(time.getMinutes());
    const seconds = String(time.getSeconds());
    let aMpM = '';
    if (!is24hour) {
        aMpM = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
    }
    clock.textContent = `${hours.padStart(2,'0')}: ${minutes.padStart(2,'0')}:  ${seconds.padStart(2 , "0")}${aMpM}`;
    setTimeout(updateClock, 1000);
}

switcher.addEventListener('click', () => {
    is24hour = !is24hour;
    switcher.textContent = is24hour ? 'Switch To 12-Hour Format' : 'Switch To 24-Hour Format';
    updateClock();
});
    updateClock();