// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', () => {
    // Get the battery level, percentage, and time elements
    const batteryLevel = document.getElementById('batteryLevel');
    const batteryPercent = document.getElementById('batteryPercent');
    const batteryTime = document.getElementById('batteryTime');

    // Update the battery status with the current battery level, percentage, and time
    function updateBatteryStatus(battery) {
        const percent = Math.round(battery.level * 100);
        batteryLevel.style.height = `${percent}%`;
        batteryPercent.textContent = `${percent}%`;

        // Add or remove classes to the body element based on the battery level
        document.body.classList.toggle('low', percent < 20);
        document.body.classList.toggle('medium', percent >= 20 && percent < 50);
        document.body.classList.toggle('high', percent >= 50);

        // Display the charging status or the remaining time until the battery is fully discharged
        batteryTime.textContent = battery.charging ? 'Charging' :
            battery.dischargingTime === Infinity ? 'Calculating...' : `${Math.round(battery.dischargingTime / 60)} minutes`;
    }

    // Attach event listeners to the battery object to update the battery status when the charging, level, or discharging time changes
    function attachEventListeners(battery) {
        battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
        battery.addEventListener('dischargingtimechange', () => updateBatteryStatus(battery));
    }

    // Get the battery object and update the battery status and attach event listeners
    navigator.getBattery().then((battery) => {
        updateBatteryStatus(battery);
        attachEventListeners(battery);
    });
});