document.addEventListener('DOMContentLoaded', function() {
    const userCountrySpan = document.getElementById('userCountry');
    const userNameSpan = document.getElementById('userName');

    if (userCountrySpan) {
        const country = localStorage.getItem('country');
        userCountrySpan.textContent = country;
    }

    if (userNameSpan) {
        const name = localStorage.getItem('name');
        userNameSpan.textContent = name;
    }
});
// Add this to your initializeDataPersistence function
if (document.getElementById('debugStorageButton')) {
    document.getElementById('debugStorageButton').addEventListener('click', function() {
      let storageInfo = "Current localStorage contents:\n\n";
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        storageInfo += `${key}: ${localStorage.getItem(key)}\n`;
      }
      alert(storageInfo);
    });
  }
