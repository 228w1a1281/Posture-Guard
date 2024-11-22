document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners to menu links
    document.querySelectorAll('.list-group-item a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            // Let the link behave normally (i.e., redirect to the href value)
            var targetUrl = this.getAttribute('href');
            window.location.href = targetUrl;
        });
    });
});
