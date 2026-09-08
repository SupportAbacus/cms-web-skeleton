import React from "react";
import { validateConnectorValue } from "@/lib/connector-validation";
import type { HeaderConnectors } from "@/lib/site-config";

export function ConnectorTags({ connectors }: { connectors?: HeaderConnectors | null }) {
  if (!connectors) return null;

  const gtm = validateConnectorValue("googleTagManagerId", connectors.googleTagManagerId);
  const ga = validateConnectorValue("googleAnalyticsId", connectors.googleAnalyticsId);
  const gAds = validateConnectorValue("googleAdsId", connectors.googleAdsId);
  const fb = validateConnectorValue("facebookPixelId", connectors.facebookPixelId);
  const clarity = validateConnectorValue("microsoftClarityId", connectors.microsoftClarityId);
  const linkedin = validateConnectorValue("linkedInPartnerId", connectors.linkedInPartnerId);
  const pinterest = validateConnectorValue("pinterestTagId", connectors.pinterestTagId);
  const tiktok = validateConnectorValue("tiktokPixelId", connectors.tiktokPixelId);
  const hotjar = validateConnectorValue("hotjarId", connectors.hotjarId);
  const yandex = validateConnectorValue("yandexMetricaId", connectors.yandexMetricaId);
  const bingUet = validateConnectorValue("bingUetTagId", connectors.bingUetTagId);
  const plausible = validateConnectorValue("plausibleDomain", connectors.plausibleDomain);

  const googleVerify = validateConnectorValue("googleSiteVerification", connectors.googleSiteVerification);
  const bingVerify = validateConnectorValue("bingSiteVerification", connectors.bingSiteVerification);
  const yandexVerify = validateConnectorValue("yandexVerification", connectors.yandexVerification);
  const fbVerify = validateConnectorValue("facebookDomainVerification", connectors.facebookDomainVerification);
  const pinterestVerify = validateConnectorValue("pinterestDomainVerification", connectors.pinterestDomainVerification);

  return (
    <>
      {googleVerify ? <meta name="google-site-verification" content={googleVerify} /> : null}
      {bingVerify ? <meta name="msvalidate.01" content={bingVerify} /> : null}
      {yandexVerify ? <meta name="yandex-verification" content={yandexVerify} /> : null}
      {fbVerify ? <meta name="facebook-domain-verification" content={fbVerify} /> : null}
      {pinterestVerify ? <meta name="p:domain_verify" content={pinterestVerify} /> : null}

      {gtm ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`,
          }}
        />
      ) : null}

      {ga ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
            }}
          />
        </>
      ) : null}

      {gAds ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `gtag('config', '${gAds}');`,
          }}
        />
      ) : null}

      {fb ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fb}');fbq('track', 'PageView');`,
          }}
        />
      ) : null}

      {clarity ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarity}");`,
          }}
        />
      ) : null}

      {linkedin ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `_linkedin_partner_id = "${linkedin}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);`,
          }}
        />
      ) : null}

      {pinterest ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
n=window.pintrk;n.queue=[],n.version="3.0";var
t=document.createElement("script");t.async=!0,t.src=e;var
r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '${pinterest}');
pintrk('page');`,
          }}
        />
      ) : null}

      {tiktok ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${tiktok}');
ttq.page();
}(window, document, 'ttq');`,
          }}
        />
      ) : null}

      {hotjar ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(h,o,t,j,a,r){
h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
h._hjSettings={hjid:${hotjar},hjsv:6};
a=o.getElementsByTagName('head')[0];
r=o.createElement('script');r.async=1;
r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
          }}
        />
      ) : null}

      {yandex ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${yandex}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });`,
          }}
        />
      ) : null}

      {bingUet ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${bingUet}", enableAutoSpaTracking: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");`,
          }}
        />
      ) : null}

      {plausible ? (
        <script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.js"
        />
      ) : null}
    </>
  );
}
