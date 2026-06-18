'use client';

import { useOrgStore } from '@/store/orgStore';

export function PrivacyPolicy() {
  const organization = useOrgStore((s) => s.organization);
  const location = useOrgStore((s) => s.location);

  const name = organization?.name ?? '';
  const domain = (organization?.canonical_domain ?? '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const street = location?.street ?? '';
  const city = location?.city ?? '';
  const stateName = location?.state?.name ?? '';
  const zipCode = location?.zip_code ?? '';

  return (
    <div className="p-5 max-w-4xl mx-auto text-black">
      <p>
        Thank you for visiting {name} (hereinafter known as &ldquo;Provider,&rdquo; &ldquo;us&rdquo; or &ldquo;we&rdquo;), which
        is otherwise known as {domain} (the &ldquo;Site&rdquo;). To better protect your privacy we provide this notice explaining our
        online information practices and the choices you can make about the way your information is collected and used. To make
        this notice easy to find, we make it available on our homepage and at every point where personally identifiable information
        may be requested.
      </p>
      <p>
        We are committed to protecting your privacy and committed to developing technology that gives you the most powerful and
        secure online experience.
      </p>
      <p>
        Billing and personal information is encrypted whenever transmitted or received online. Personal information is accessible
        only to staff, agents, or contractors of Provider. This privacy statement applies to all Provider-owned web sites and
        domains. This privacy statement covers personally identifiable information, anonymous data collection and aggregate
        reporting. Personally identifiable information is any information that is associated with your name or personal identity.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">What we collect</h2>
      <p>
        During a Login, Registration, or Checkout process, the types of personal information you provide to us may include, but
        are not limited to, name, address, phone, fax, email address, license number, date of birth, username and password,
        billing information, transaction, and credit card information. Other information we may collect includes third party
        affiliates or partnerships, or customer service inquiry information.
      </p>
      <p>
        When you browse our web site, you do so anonymously. We may log your IP address (the Internet address of your computer) to
        give us an idea of which part of our web site you visit and how long you spend there. But we will not link your IP address
        to any personal information unless you have logged in to our web site. Like many other commercial web sites, the Provider
        web site may use a standard technology called a &quot;cookie&quot; to collect information about how you use the site.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">How we use it</h2>
      <p>We may use your personal information for the following purposes:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>To make the site easier for you to use by not making you enter your personal information more than once.</li>
        <li>To deliver services that you request or purchase.</li>
        <li>To help us create and publish content most relevant to you.</li>
        <li>To alert you of new products, product upgrades, special offers, updated information and other new services provided from Provider.</li>
        <li>To provide feedback in an online survey.</li>
        <li>To participate in promotional offers, contests, surveys, events and other programs.</li>
        <li>To request assistance or fill out support requests.</li>
        <li>To comply with requests from law enforcement.</li>
        <li>To make anonymous personal information provided to third parties for purposes of analysis and reporting.</li>
        <li>To supplement personal information collected from you with additional information from publicly available and commercially available sources and/or information from alliances, business partners and affiliates.</li>
        <li>To operate, assess and evaluate our business.</li>
        <li>To associate your information with other third party data for the purpose of delivering relevant customer experiences.</li>
        <li>To protect against fraud and other unlawful activities, claims and liabilities.</li>
        <li>To comply with applicable legal requirements, relevant industry standards, contractual obligations and our policies.</li>
      </ul>

      <h2 className="container font-bold text-xl mt-6 mb-3">Who we share it with</h2>
      <p>
        We never sell or rent your personal information. Provider may disclose your personal information if required to do so by
        law (for example, a subpoena) or regulation, or in good faith to (a) comply with legal processes served on the site, or
        (b) protect the rights and property of Provider, or (c) where our records indicate fraudulent activity or other deceptive
        practices that a governmental agency should be made aware of, or (d) where your communication suggests possible harm to
        others.
      </p>
      <p>
        Provider may transfer information about Users if Provider is acquired by or merged with another company. Provider is not
        responsible for notifying User of such changes.
      </p>
      <p>
        Provider may share some of your information with Campaigns for the purpose of allowing the User to receive premium
        benefits or recognition that may be offered by Campaigns on this Site.
      </p>
      <p>
        Provider will not share your information with third parties without your permission, other than what is mentioned in this
        Privacy Policy. It will only be used for the purposes stated above.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">Internet Commerce</h2>
      <p>
        The online registration at Provider is designed to give you options concerning the privacy of your credit card
        information, name, address, e-mail and any other information you provide us. Provider is committed to data security with
        respect to information collected on our site. We offer the industry standard security measures available through your
        browser called SSL encryption.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">Security of your Personal Information</h2>
      <p>
        Provider strictly protects the security of your personal information. We carefully protect your data from loss, misuse,
        unauthorized access or disclosure, alteration, or destruction.
      </p>
      <p>
        Your personal information is never shared outside the company without your permission, except as stated herein. Inside
        the company, data is stored in password-controlled servers with limited access.
      </p>
      <p>
        You also have a significant role in protecting your information. No one can see or edit your personal information without
        knowing your username and password, so do not share these with others.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">Children&apos;s Privacy</h2>
      <p>
        We do not knowingly collect, maintain, or use information from children under 13 and we do not want it. We will take
        steps to delete it if we learn we have collected it. No part of Provider&apos;s site is directed to children under the age
        of 13.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">Links</h2>
      <p>
        This website may contain links to other sites. Please be aware that we are not responsible for the content or privacy of
        such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any
        other site that collects personally identifiable information.
      </p>

      <h2 className="container font-bold text-xl mt-6 mb-3">Your Choices</h2>
      <p>We offer you a number of choices with respect to communications options:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>You may opt-in to receive information, future offers, updates and promotions.</li>
        <li>You may choose to interact with the websites as a visitor, without signing up to receive future communications.</li>
        <li>At any point, you may unsubscribe to the opt-in email list by following the email links on our website.</li>
      </ul>

      <h2 className="container font-bold text-xl mt-6 mb-3">Problems or complaints with Provider&apos;s Privacy Policy</h2>
      <p>
        We value your comments and opinions. If you have questions, comments or a complaint about compliance with this privacy
        policy you may contact us at EMAIL ADDRESS. Or, you may also write to us:
      </p>
      <p>
        {name}
        <br />
        {street}
        <br />
        {city}, {stateName} {zipCode}
      </p>
    </div>
  );
}
