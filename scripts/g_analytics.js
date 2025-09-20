let host = window.location.hostname;
if(host != "localhost")
{
    let scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'https://www.googletagmanager.com/gtag/js?id=G-NWRWDZZ03F';
    let s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(scriptTag, s);
}