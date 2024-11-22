document.addEventListener('DOMContentLoaded', function () {
    // Redirect links in the menu
    document.querySelectorAll('.list-group-item a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetUrl = this.getAttribute('href');
            window.location.href = targetUrl;
        });
    });

    // Handle editing profile information
    const editBtn = document.querySelector('.edit-btn');

    if (editBtn) {
        editBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            var targetUrl = this.getAttribute('href');
            window.location.href = targetUrl;


            // Get the current values of name and email
            const newName = document.querySelector('.profile-info p:nth-of-type(1)').textContent.trim().split(': ')[1];
            const newEmail = document.querySelector('.profile-info p:nth-of-type(2)').textContent.trim().split(': ')[1];


            if (newName && newEmail) {
                // Log the updated values
                console.log('Updated Name:', newName);
                console.log('Updated Email:', newEmail);

                // Update the displayed values
                document.querySelector('.profile-info p:nth-of-type(1)').innerHTML = `<strong>Name:</strong> ${newName}`;
                document.querySelector('.profile-info p:nth-of-type(2)').innerHTML = `<strong>Email:</strong> ${newEmail}`;
            } else {
                alert('Both fields are required to update your profile.');
            }
        });
    }
});
