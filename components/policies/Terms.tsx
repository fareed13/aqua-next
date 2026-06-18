'use client';

import { useOrgStore } from '@/store/orgStore';

export function TermsOfService() {
  const organization = useOrgStore((s) => s.organization);
  const name = organization?.name ?? '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-black">
      <h2 className="text-black text-center text-2xl font-bold mb-6">
        How To Navigate And Use Our Website
      </h2>

      <h3 className="font-bold text-lg mt-6 mb-2">1. Introduction</h3>
      <p className="mb-4">
        These Website Standard Terms And Conditions (these &ldquo;Terms&rdquo; or these &ldquo;Website Standard Terms And
        Conditions&rdquo;) contained herein on this webpage, shall govern your use of this website, including all pages
        within this website (collectively referred to herein below as this &ldquo;Website&rdquo;). These Terms apply in
        full force and effect to your use of this Website and by using this Website, you expressly accept all terms and
        conditions contained herein in full. You must not use this Website, if you have any objection to any of these
        Website Standard Terms And Conditions.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">2. Intellectual Property Rights</h3>
      <p className="mb-4">
        Other than content you own, which you may have opted to include on this Website, under these Terms, {name} and/or
        its licensors own all rights to the intellectual property and material contained in this Website, and all such
        rights are reserved. You are granted a limited license only, subject to the restrictions provided in these Terms,
        for purposes of viewing the material contained on this Website.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">3. Restrictions</h3>
      <p className="mb-4">You are expressly and emphatically restricted from all of the following:</p>
      <ol className="list-decimal pl-6 space-y-2 mb-4">
        <li>publishing any Website material in any media;</li>
        <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
        <li>publicly performing and/or showing any Website material;</li>
        <li>using this Website in any way that is, or may be, damaging to this Website;</li>
        <li>using this Website in any way that impacts user access to this Website;</li>
        <li>using this Website contrary to applicable laws and regulations, or in a way that causes, or may cause, harm to the Website, or to any person or business entity;</li>
        <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website, or while using this Website;</li>
        <li>using this Website to engage in any advertising or marketing.</li>
      </ol>

      <h3 className="font-bold text-lg mt-6 mb-2">4. Your Content</h3>
      <p className="mb-4">
        In these Website Standard Terms And Conditions, &ldquo;Your Content&rdquo; shall mean any audio, video, text, images or
        other material you choose to display on this Website. With respect to Your Content, by displaying it, you grant {name} a
        non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate
        and distribute it in any and all media. Your Content must be your own and must not be infringing on any third party&apos;s
        rights. {name} reserves the right to remove any of Your Content from this Website at any time, and for any reason,
        without notice.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">5. No warranties</h3>
      <p className="mb-4">
        This Website is provided &ldquo;as is,&rdquo; with all faults, and {name} makes no express or implied representations or
        warranties, of any kind related to this Website or the materials contained on this Website. Additionally, nothing
        contained on this Website shall be construed as providing consult or advice to you.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">6. Limitation of liability</h3>
      <p className="mb-4">
        In no event shall {name}, nor any of its officers, directors and employees, be liable to you for anything arising out of
        or in any way connected with your use of this Website, whether such liability is under contract, tort or otherwise, and
        {name}, including its officers, directors and employees shall not be liable for any indirect, consequential or special
        liability arising out of or in any way related to your use of this Website.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">7. Indemnification</h3>
      <p className="mb-4">
        You hereby indemnify to the fullest extent {name} from and against any and all liabilities, costs, demands, causes of
        action, damages and expenses (including reasonable attorney&apos;s fees) arising out of or in any way related to your
        breach of any of the provisions of these Terms.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">8. Severability</h3>
      <p className="mb-4">
        If any provision of these Terms is found to be unenforceable or invalid under any applicable law, such unenforceability
        or invalidity shall not render these Terms unenforceable or invalid as a whole, and such provisions shall be deleted
        without affecting the remaining provisions herein.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">9. Variation of Terms</h3>
      <p className="mb-4">
        {name} is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to
        review such Terms on a regular basis to ensure you understand all terms and conditions governing use of this Website.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">10. Assignment</h3>
      <p className="mb-4">
        {name} shall be permitted to assign, transfer, and subcontract its rights and/or obligations under these Terms without
        any notification or consent required. However, you shall not be permitted to assign, transfer, or subcontract any of
        your rights and/or obligations under these Terms.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">11. Entire Agreement</h3>
      <p className="mb-4">
        These Terms, including any legal notices and disclaimers contained on this Website, constitute the entire agreement
        between {name} and you in relation to your use of this Website, and supersede all prior agreements and understandings
        with respect to the same.
      </p>

      <h3 className="font-bold text-lg mt-6 mb-2">12. Governing Law &amp; Jurisdiction</h3>
      <p className="mb-4">
        These Terms will be governed by and construed in accordance with the laws of the State of Western Australia, and you
        submit to the non-exclusive jurisdiction of the state and federal courts located in Western Australia for the resolution
        of any disputes.
      </p>
    </div>
  );
}
