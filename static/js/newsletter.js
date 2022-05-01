function newsletterSubscribe() {
    const email = document.getElementById('newsletter-subscribe-input').value
    posthog.capture('newsletter_subscribe', {
        new_subscriber_email: email
    })
    document.getElementById('newsletter-subscribe-input').value = ""
    document.getElementById('newsletter-subscribe-btn').innerHTML = "✓"
}