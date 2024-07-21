// battery.js

document.addEventListener('DOMContentLoaded', () => {
    const batteryContainer = document.getElementById('batteryLevel');
    const batteryPercent = document.getElementById('batteryPercent');
    const batteryTime = document.getElementById('batteryTime');

    function updateBatteryStatus(battery) {
        const percent = Math.round(battery.level * 100);
        document.querySelector('.battery-level').style.height = `${percent}%`;
        batteryPercent.textContent = `${percent}%`;

        document.body.classList.toggle('low', percent < 20);
        document.body.classList.toggle('medium', percent >= 20 && percent < 50);
        document.body.classList.toggle('high', percent >= 50);

        if (battery.charging) {
            batteryTime.textContent = 'Charging';
        } else if (battery.dischargingTime === Infinity) {
            batteryTime.textContent = 'Calculating...';
        } else {
            const hours = Math.floor(battery.dischargingTime / 3600);
            const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
            batteryTime.textContent = `${hours} hours ${minutes} minutes`;
        }
    }

    if ('getBattery' in navigator) {
        navigator.getBattery().then((battery) => {
            updateBatteryStatus(battery);
            battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
            battery.addEventListener('dischargingtimechange', () => updateBatteryStatus(battery));
        }).catch((error) => {
            console.error('Battery API not supported:', error);
        });
    } else {
        console.error('Battery API not supported');
    }
});