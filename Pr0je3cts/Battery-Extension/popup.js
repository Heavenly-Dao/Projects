document.getElementById('changeColor').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'getColor' }, (response) => {
    document.body.style.backgroundColor = response.color;
  });
});
