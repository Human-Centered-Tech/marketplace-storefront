import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Merchant Terms of Service — Catholic Owned®",
  description:
    "The Merchant Terms of Service governing participation by approved merchants in the Catholic Owned® Marketplace.",
}

const EFFECTIVE_DATE = "May 28, 2026"

type Block = string | { list: string[] }

type TermsSection = {
  title: string
  blocks: Block[]
}

const SECTIONS: TermsSection[] = [
  {
    title: "0. Definitions",
    blocks: [
      "The following terms have the meanings set forth below when used in these Merchant Terms. This section is newly added to provide legal clarity throughout the document.",
      '"Catholic Owned, PBC" or "Catholic Owned®" means Catholic Owned, PBC, a Delaware public benefit corporation, and its successors and assigns.',
      '"Merchant" or "you" or "your" means any individual or entity approved to sell products through the Catholic Owned® Marketplace.',
      '"Catholic Owned® Marketplace" or "Marketplace" means the online marketplace platform operated by Catholic Owned, PBC at www.catholicowned.com and any associated applications or services.',
      '"Buyer" means any individual or entity that purchases or attempts to purchase a product through the Catholic Owned® Marketplace.',
      '"Transaction" means a completed purchase by a Buyer of a Merchant product through the Catholic Owned® Marketplace.',
      '"Payout" means the net amount payable to a Merchant after deduction of applicable fees, refunds, chargebacks, reserves, and any other offsets.',
      '"Reserve" means funds withheld from a Merchant\'s Payout by Catholic Owned® to cover potential refunds, chargebacks, disputes, fees, or losses.',
      '"Chargeback" means a reversal of a payment initiated by a Buyer\'s card issuer or payment provider.',
      '"Restricted Products" means product categories that require prior written approval, additional documentation, or additional compliance requirements before listing on the Catholic Owned® Marketplace, as described in Section 6.',
      '"Payment Processor" means Catholic Owned\'s then-current third-party payment processing provider, currently Stripe, Inc., as may be updated from time to time.',
      '"Tax Calculation Provider" means Catholic Owned\'s then-current third-party sales tax calculation and remittance provider, currently Stripe Tax, as may be updated from time to time.',
    ],
  },
  {
    title: "Preamble",
    blocks: [
      'These Merchant Terms of Service ("Merchant Terms") govern participation by approved merchants ("Merchants," "you," or "your") in the Catholic Owned® Marketplace operated by Catholic Owned, PBC ("Catholic Owned®," "Company," "we," "us," or "our").',
      "Catholic Owned, PBC acts as the merchant of record for transactions completed through the Catholic Owned® Marketplace and may act as the marketplace facilitator for applicable sales tax purposes. Merchants remain the sellers, suppliers, and fulfillers of the products they list and are responsible for their products, listings, fulfillment, shipping, buyer communication, compliance, and any losses arising from their products or failures, as set forth in these Merchant Terms.",
      "By applying to sell, creating a Merchant account, listing products, accepting orders, receiving payouts, or otherwise participating in the Catholic Owned® Marketplace, you agree to be bound by these Merchant Terms and all Catholic Owned® policies applicable to Merchants, including any general website terms, privacy policy, marketplace policies, return and refund policies, prohibited and restricted products policies, shipping policies, onboarding requirements, payment processor terms, tax processing terms, and any additional terms presented to you in writing at or before the time of application or onboarding. These policies are incorporated into these Merchant Terms by reference.",
      "If you are accepting these Merchant Terms on behalf of a business, organization, or other entity, you represent that you have authority to bind that entity to these Merchant Terms.",
    ],
  },
  {
    title: "1. Purpose of the Marketplace",
    blocks: [
      "Catholic Owned® operates the Catholic Owned® Marketplace to help buyers discover and purchase products from businesses that align with the mission, values, and standards of Catholic Owned®.",
      "Catholic Owned, PBC is a Delaware public benefit corporation. Catholic Owned® may make marketplace decisions based on its mission, public benefit purpose, Catholic standards, buyer trust, marketplace integrity, long-term sustainability, and its sole and absolute business and mission-based judgment.",
      "Participation in the Catholic Owned® Marketplace is a privilege, not a right. Catholic Owned® may approve, reject, suspend, restrict, or remove Merchants or products as permitted by these Merchant Terms.",
    ],
  },
  {
    title: "2. Catholic Owned, PBC as Merchant of Record",
    blocks: [
      "For transactions completed through the Catholic Owned® Marketplace, Catholic Owned, PBC is the merchant of record.",
      "Catholic Owned, PBC may also act as the marketplace facilitator for applicable sales tax purposes, including calculating, collecting, reporting, and remitting applicable sales tax where required.",
      "Catholic Owned® may process payments, refunds, cancellations, chargebacks, tax collections, adjustments, and other transaction-related actions as necessary to operate the Catholic Owned® Marketplace, protect the buyer experience, comply with payment processor requirements, comply with applicable sales tax obligations, and comply with applicable law.",
      "Although Catholic Owned, PBC is the merchant of record, Merchants remain the sellers, suppliers, and fulfillers of the products they list and remain responsible for their products, listings, order fulfillment, shipping, buyer communication, returns, replacements, product compliance, and compliance with these Merchant Terms.",
      "Catholic Owned® may offset amounts owed by a Merchant against Merchant payouts or future amounts payable to the Merchant. If any amount owed by a Merchant to Catholic Owned® cannot be fully recovered through payout offsets, reserves, or future amounts payable to the Merchant, the Merchant agrees to reimburse Catholic Owned® upon request. Catholic Owned® may invoice the Merchant or use any lawful collection method available to recover amounts owed.",
      "Nothing in these Merchant Terms limits Catholic Owned, PBC's obligations to buyers, payment processors, tax authorities, regulators, or other third parties where such obligations cannot legally be shifted to a Merchant. These Merchant Terms allocate responsibility as between Catholic Owned® and the Merchant to the fullest extent permitted by law.",
    ],
  },
  {
    title: "3. Merchant Eligibility and Approval",
    blocks: [
      "Participation in the Catholic Owned® Marketplace requires approval by Catholic Owned®.",
      "Merchants may also be required to complete onboarding through our Payment Processor and to agree to the Payment Processor's applicable terms, conditions, identity verification requirements, underwriting requirements, compliance obligations, and payment processing requirements.",
      "Catholic Owned® and/or the Payment Processor may reject, suspend, delay, restrict, or terminate a Merchant's participation if required information is incomplete, inaccurate, unverifiable, unacceptable, or otherwise creates legal, compliance, operational, financial, reputational, payment, or marketplace risk.",
    ],
  },
  {
    title:
      "4. Catholic Owned® Founding Pillars and Marketplace Eligibility Standards",
    blocks: [
      "Catholic Owned® is a mission-based marketplace. Participation in the Catholic Owned® Marketplace is limited to Merchants whose businesses operate consistently with Catholic Owned®'s marketplace eligibility standards, as determined by Catholic Owned® in its sole and absolute discretion, and who represent that they adhere to the Catholic Owned® Founding Pillars.",
      "By applying to sell, creating a Merchant account, listing products, accepting orders, or continuing to participate in the Catholic Owned® Marketplace, each Merchant represents and warrants that the Merchant satisfies the Catholic Owned® marketplace eligibility standards and adheres to the Catholic Owned® Founding Pillars:",
      {
        list: [
          "Faithful to the Magisterium and in full communion with Rome.",
          "A regularly practicing, sincere Catholic in good standing, including Sunday and Holy Day Mass attendance and regular confession.",
          "Prays the Rosary or practices other sincere daily devotion.",
          "Operates the business in accordance with the principles of the Catholic faith.",
        ],
      },
      "These representations are material to Catholic Owned®'s decision to approve and continue Merchant participation in the Catholic Owned® Marketplace.",
      "Catholic Owned® may rely on these representations when approving, reviewing, restricting, suspending, or terminating a Merchant account. Catholic Owned® is not required to independently verify each representation but may request additional information from a Merchant if Catholic Owned® determines that further review is appropriate.",
      "Merchants agree that their products, listings, business practices, communications, and conduct on the Catholic Owned® platform must remain consistent with Catholic values and the mission of Catholic Owned®.",
      "Catholic Owned® reserves the right to determine, in its sole and absolute discretion, whether a Merchant, product, listing, image, description, message, or business practice violates these standards.",
    ],
  },
  {
    title: "5. Permitted Products and Listing Requirements",
    blocks: [
      "Merchants may only list physical products available for shipment to buyers, unless Catholic Owned® gives prior written permission for another type of product.",
      "Listings must offer an actual product for sale. Merchants may not create listings for referral codes, advertisements, donations, crowdfunding, lead generation, services, event tickets, gift cards, or other non-product purposes unless Catholic Owned® gives prior written approval.",
      "Each listing must accurately represent the product being sold, including the nature of the product, who made or designed it, where it ships from, applicable materials or ingredients, customization details, fulfillment timelines, and any other information reasonably necessary for a buyer to make an informed purchase.",
      "Catholic Owned® may reject, remove, suppress, or require edits to any listing that Catholic Owned® determines is incomplete, inaccurate, misleading, noncompliant, inconsistent with Catholic Owned® standards, or otherwise unsuitable for the Catholic Owned® Marketplace.",
      "Note on Shipping-Included Pricing: Catholic Owned® requires that standard shipping costs be included in the product price. Merchants should account for shipping costs when setting product prices. This policy ensures a transparent, no-surprise checkout experience for buyers and is a standard requirement for all Merchants on the Catholic Owned® Marketplace. See Section 12 for details.",
    ],
  },
  {
    title: "6. Product Standards and Prohibited or Restricted Products",
    blocks: [
      "Merchants may only list products that are lawful, accurately described, safe, and aligned with Catholic values and the standards of Catholic Owned®.",
      "Merchants may not list products that Catholic Owned® determines, in its sole discretion, are contrary to Catholic teaching, offensive to the Catholic faith, blasphemous, obscene, sexually explicit, occult or New Age in a manner that promotes practices contrary to the Catholic faith, hateful, counterfeit, illegal, unsafe, misleading, infringing, or otherwise inconsistent with the mission and values of Catholic Owned®.",
      "Certain product categories may be allowed only with prior written approval from Catholic Owned®, additional documentation, additional compliance requirements, specific shipping procedures, age verification, insurance, licenses, disclosures, or other conditions. Restricted products may include, without limitation, wine or other regulated goods, food or beverage products, herbal teas, vitamins, supplements, cosmetics, skincare, candles, children's products, products with small parts, products making health or wellness claims, personalized products, religious goods requiring special handling, books or educational materials addressing sensitive topics, and other products Catholic Owned® determines may create elevated legal, safety, regulatory, payment processor, reputational, or marketplace risk.",
      "Wine and other alcohol-related products may be allowed only with Catholic Owned®'s prior written approval and only where the Merchant and transaction satisfy all applicable licensing, age verification, tax, carrier, destination-state, and delivery requirements.",
      "Catholic Owned® may allow Catholic books, educational materials, or other content that discusses occult, New Age, immoral, controversial, or sensitive topics in a critical, educational, apologetical, pastoral, or otherwise Catholic-aligned manner, provided Catholic Owned® determines the product and listing are consistent with Catholic values.",
      "Merchants may not list, sell, ship, or promote products that are prohibited by Catholic Owned®, the Payment Processor, shipping carrier rules, the Tax Calculation Provider, or applicable law.",
      "For minor product-level violations (as distinguished from account-level violations), Catholic Owned® will generally provide the Merchant with written notice and a reasonable opportunity to correct the violation, which shall not be less than forty-eight (48) hours, before taking further action, unless Catholic Owned® determines that the nature or severity of the violation requires immediate action. Nothing in this paragraph limits Catholic Owned®'s right to take immediate action for serious, repeated, unlawful, harmful, fraudulent, unsafe, infringing, or mission-inconsistent violations.",
      "Product violations may result in product removal, account restriction, payout delays, reserves, suspension, termination, or other action Catholic Owned® deems appropriate. No refund will be provided for suspended or terminated accounts, except where required by applicable law.",
    ],
  },
  {
    title: "7. Production Partners, Dropshipping, and Reselling",
    blocks: [
      "Merchants may not list undisclosed dropshipped, counterfeit, mass-resold, or third-party products that they do not make, design, own, curate, or have lawful authority to sell, unless Catholic Owned® gives prior written approval. For clarity, Merchants who are genuine Catholic retailers, bookstores, or religious goods shops reselling products they did not manufacture may be approved to do so with appropriate disclosure to Catholic Owned® and accurate representation in their listings. The prohibition in this section targets undisclosed dropshipping of non-curated goods, not authentic Catholic retail.",
      "If a Merchant works with a production partner, manufacturer, printer, fulfillment partner, supplier, or other third party involved in creating, producing, packaging, or shipping a product, the Merchant must accurately disclose such relationship to Catholic Owned® upon request and must ensure that the final product and fulfillment process comply with these Merchant Terms.",
      "Merchants remain fully responsible for products created, produced, supplied, fulfilled, or shipped by any production partner or third party.",
    ],
  },
  {
    title: "8. Commitment to Excellence",
    blocks: [
      "Merchants agree to fulfill orders with the highest levels of professionalism, communication, and care. The following are examples of expected conduct; failure to meet the specific performance standards set forth in Sections 13 and 18 of these Merchant Terms may result in the consequences described in those sections.",
      "This includes, but is not limited to:",
      {
        list: [
          "Shipping orders efficiently and within the required timeframe.",
          "Communicating promptly and respectfully with buyers.",
          "Providing accurate order updates.",
          "Uploading tracking information to the Catholic Owned® platform as orders ship.",
          "Handling fulfillment, returns, replacements, and buyer concerns professionally.",
          "Maintaining a buyer experience that reflects well on Catholic Owned® and the broader Catholic business community.",
        ],
      },
    ],
  },
  {
    title: "9. Quality Listings",
    blocks: [
      "Merchants agree to provide and maintain high-quality product listings.",
      "Each listing must include accurate, complete, and current information, including product descriptions, pricing, product photography, available inventory, customization details if applicable, and expected fulfillment timelines.",
      "Merchants are responsible for keeping inventory accurate and up to date. A Merchant may not knowingly list products that are unavailable, materially different from the description, or unable to be fulfilled within the stated timeline.",
      "Product photography, descriptions, artwork, graphics, and designs must be original to the Merchant, owned by the Merchant, properly licensed by the Merchant, or otherwise lawfully used by the Merchant. Products must include original or owned art or designs.",
      "Merchants may not list products whose primary artwork, design, or creative expression was generated by artificial intelligence unless Catholic Owned® gives prior written approval. Catholic Owned® may require disclosure of AI-generated or AI-assisted content and may remove AI-generated or AI-assisted products at its sole discretion.",
      "Merchants are solely responsible for ensuring that their listings do not infringe the intellectual property, publicity, privacy, or other rights of any third party.",
    ],
  },
  {
    title: "10. Product Claims, Safety, Labeling, and Warnings",
    blocks: [
      "Merchants are responsible for any required product labels, safety warnings, age ratings, ingredient disclosures, allergen disclosures, country-of-origin disclosures, instructions, certifications, or other legally required product information.",
      "Merchants are responsible for ensuring that all product claims are truthful, substantiated, not misleading, and compliant with applicable law.",
      "Merchants are responsible for determining whether their products are subject to special legal, safety, labeling, testing, disclosure, shipping, or regulatory requirements, including requirements applicable to children's products, food, beverages, alcohol, cosmetics, candles, skincare, supplements, apparel, religious goods, personalized products, and other regulated or higher-risk product categories.",
      "Catholic Owned® does not assume responsibility for the accuracy, legality, labeling, safety, warnings, or compliance of Merchant products or listings.",
    ],
  },
  {
    title: "11. Promotions, Discounts, and Truthful Pricing",
    blocks: [
      "Merchants are responsible for ensuring that prices, discounts, comparisons, sales, promotional claims, and product claims are accurate, truthful, not misleading, and compliant with applicable law.",
      'Merchants may not use false reference prices, misleading "was/now" pricing, deceptive scarcity claims, fabricated discounts, inaccurate sale deadlines, or any other promotional practice that misrepresents the value, timing, availability, or terms of an offer.',
      'Merchants represent that any "was/now," "compare at," "retail value," sale, scarcity, discount, limited-time, or promotional claim is truthful, legally compliant, and supported by appropriate records.',
      "Merchants must maintain records reasonably sufficient to substantiate pricing, discounts, comparison prices, former prices, scarcity claims, promotional claims, product claims, and sale claims, and must provide those records to Catholic Owned® upon request.",
      "Catholic Owned® may remove, modify, reject, or require correction of any price, promotion, discount, or claim that Catholic Owned® determines may be inaccurate, misleading, noncompliant, or harmful to buyer trust.",
    ],
  },
  {
    title: "12. Shipping Included in Pricing",
    blocks: [
      "Merchants agree that standard shipping must be included in the product price.",
      "Merchants are responsible for setting prices that include enough margin to cover their product costs, packaging, standard shipping, handling, and desired profit margin.",
      "Unless Catholic Owned® later authorizes additional shipping methods, such as overnight shipping or upgraded shipping options, Merchants may not add separate standard shipping charges to buyers.",
      "Merchants are responsible for managing shipments through their usual shipping system and must upload tracking numbers to the Catholic Owned® platform as orders ship.",
    ],
  },
  {
    title: "13. Fulfillment Timeline and Shipping Delays",
    blocks: [
      "Merchants must ship orders within two business days unless the product is a custom product.",
      "For custom products, the listing must clearly state the expected fulfillment timeline before purchase. Merchants agree to honor the stated fulfillment timeline.",
      "Merchants must have a reasonable basis for any stated shipping or fulfillment timeline. If a Merchant cannot ship an order within the required or stated timeframe, the Merchant must promptly notify Catholic Owned® and the buyer.",
      "If an order cannot ship within the required or stated timeframe, Catholic Owned® may require the Merchant to obtain buyer consent to the delay, cancel the order, provide a replacement, or reimburse Catholic Owned® for any refund or cost issued to the buyer.",
      "Repeated delays, failure to communicate, or failure to fulfill orders may result in refunds, chargebacks, payout offsets, reserves, product removal, account suspension, or termination.",
      "Force majeure events that directly prevent a Merchant from shipping (such as a natural disaster, government-ordered closure, or declared emergency affecting the Merchant's location) may excuse a Merchant's fulfillment obligations for the duration of the event, provided the Merchant promptly notifies Catholic Owned® and the affected buyer and cooperates in good faith to resolve or reschedule the affected order.",
    ],
  },
  {
    title: "14. Marketplace Fees",
    blocks: [
      "Merchants agree to pay the following Catholic Owned® Marketplace fees:",
      {
        list: [
          "Annual Merchant Fee: $99 per year.",
          "Transaction Fee: 11% of each transaction, consisting of payment processing fees charged by the Payment Processor (currently approximately 3%) and an 8% Catholic Owned® platform fee. The payment processing component may fluctuate based on Payment Processor pricing. If payment processing costs increase, Catholic Owned® will provide Merchants with at least thirty (30) days written notice before adjusting the total transaction fee percentage to reflect such changes.",
        ],
      },
      "The 11% transaction fee is calculated on the total product price net of any discounts and is deducted before Merchant payout.",
      "The annual $99 Merchant Fee is non-refundable, including in cases of account suspension, termination, inactivity, voluntary cancellation, product removal, or failure to generate sales, except where Catholic Owned® determines otherwise or where required by applicable law.",
      "Catholic Owned® may update fees in the future by providing at least thirty (30) days' advance written notice to Merchants prior to the effective date of any fee increase. Continued use of the Catholic Owned® Marketplace after fee changes become effective constitutes acceptance of the updated fees.",
      "Advertising Programs: Catholic Owned® does not currently charge Merchants any advertising fees beyond the standard 11% transaction fee described above. If Catholic Owned® introduces optional or mandatory advertising programs in the future, Catholic Owned® will provide Merchants with at least thirty (30) days' advance written notice and will clearly describe any associated fees, opt-in or opt-out rights, and applicable terms before such programs take effect.",
    ],
  },
  {
    title: "15. Payouts",
    blocks: [
      "Merchant payouts will be processed according to Catholic Owned®'s payout schedule as published on the Catholic Owned® platform and updated from time to time, and the requirements of our Payment Processor.",
      "Catholic Owned® may delay, withhold, reduce, or offset payouts when necessary due to refunds, cancellations, chargebacks, buyer disputes, suspected fraud, policy violations, tax adjustments, payment processor requirements, reserves, or any amounts owed by the Merchant to Catholic Owned®.",
      "Catholic Owned® is not responsible for payout delays caused by the Payment Processor, banks, payment networks, verification requirements, fraud reviews, incomplete Merchant information, or circumstances beyond Catholic Owned®'s reasonable control.",
      "If a Merchant owes Catholic Owned® amounts that cannot be recovered through payout offsets, reserves, or future amounts payable to the Merchant, the Merchant agrees to reimburse Catholic Owned® upon request. Catholic Owned® may invoice the Merchant or use any lawful collection method available to recover amounts owed.",
    ],
  },
  {
    title: "16. Payment Reserves and Risk Controls",
    blocks: [
      "Catholic Owned® may establish, hold, or require reserves against Merchant payouts when Catholic Owned® reasonably determines there is elevated risk of refunds, chargebacks, fraud, fulfillment failure, unusual order activity, buyer disputes, policy violations, product liability exposure, regulatory risk, payment processor risk, or other marketplace risk.",
      "Catholic Owned® may also limit, delay, suspend, or condition payouts; reduce listing visibility; require additional verification; restrict account activity; cancel orders; remove products; or take other reasonable risk-control measures to protect buyers, Catholic Owned®, payment processors, or the Catholic Owned® Marketplace.",
      "Any reserve may be held for as long as Catholic Owned® reasonably determines is necessary to cover potential refunds, chargebacks, adjustments, fees, disputes, penalties, investigations, claims, or losses.",
    ],
  },
  {
    title: "17. Refunds, Returns, Cancellations, and Chargebacks",
    blocks: [
      "Catholic Owned® may process refunds, cancellations, chargebacks, replacements, credits, or other adjustments when Catholic Owned® determines it is necessary to protect the buyer experience, comply with payment processor requirements, comply with applicable law, resolve a dispute, or preserve trust in the Catholic Owned® Marketplace.",
      "Merchants remain financially responsible for any refund, chargeback, fee, penalty, loss, replacement, shipping failure, tax adjustment, or other cost arising from their products, listings, fulfillment failures, misrepresentations, misconduct, or policy violations.",
      "Catholic Owned® may offset these amounts against Merchant payouts or future amounts owed. If available payouts are insufficient, the Merchant agrees to reimburse Catholic Owned® upon request for any remaining amounts owed.",
      "Merchants agree to cooperate promptly and in good faith with chargeback disputes, buyer claims, fraud reviews, refund investigations, and payment processor inquiries.",
      "Merchants must provide Catholic Owned® with any information reasonably requested to investigate or respond to a refund, return, cancellation, chargeback, or buyer dispute, including tracking numbers, delivery confirmation, proof of shipment, product photos, buyer communications, and other relevant documentation.",
    ],
  },
  {
    title: "18. Order Issues and Buyer Disputes",
    blocks: [
      "When a Buyer reports an issue with an order, Catholic Owned® will endeavor to follow the process below. Catholic Owned® reserves the right to deviate from this process when it determines that prompt or immediate action is necessary to protect the buyer, comply with law, or address fraud or misconduct.",
      "Step 1 — Merchant Notification: Catholic Owned® will notify the Merchant of the reported issue by email or through the Catholic Owned® platform.",
      "Step 2 — Merchant Response: The Merchant shall respond to the reported issue within forty-eight (48) hours of notification (or such shorter period as Catholic Owned® may specify in urgent cases), providing tracking information, proof of shipment, or other relevant documentation.",
      "Step 3 — Resolution: If the Merchant responds and proposes a resolution (such as replacement, refund, or re-shipment), Catholic Owned® will review and may approve or require an alternative resolution. If the Merchant fails to respond within the required timeframe, Catholic Owned® may resolve the issue in favor of the Buyer and offset related costs against Merchant payouts.",
      "Step 4 — Merchant Review Request: If a Merchant believes a dispute resolution was made in error, the Merchant may submit a written review request to support@catholicowned.com within seven (7) days of the resolution. Catholic Owned® will review the request and respond within a reasonable time. Catholic Owned®'s determination following internal review is final.",
      "Order issues may include, but are not limited to, products that do not arrive, arrive late, arrive damaged, materially differ from the listing description, are missing items, are defective, or otherwise fail to meet the expectations reasonably created by the listing.",
    ],
  },
  {
    title: "19. Return and Refund Policies",
    blocks: [
      "Merchants must comply with Catholic Owned®'s buyer-facing return, refund, cancellation, and replacement policies, as updated or made available by Catholic Owned® from time to time.",
      "Catholic Owned® may establish different return or refund standards for different product types.",
      "If Catholic Owned® determines that a buyer is entitled to a refund, replacement, return, cancellation, or other remedy under Catholic Owned® policies, payment processor requirements, applicable law, or Catholic Owned®'s buyer experience standards, the Merchant agrees to cooperate and reimburse Catholic Owned® for any related refund, replacement, fee, shipping cost, chargeback, adjustment, or loss.",
    ],
  },
  {
    title: "20. Sales Tax",
    blocks: [
      "Catholic Owned, PBC uses the Tax Calculation Provider to support sales tax calculation, collection, reporting, and remittance for Catholic Owned® Marketplace transactions where Catholic Owned, PBC is required to collect and remit applicable sales tax as a marketplace facilitator, merchant of record, or other responsible party.",
      "Merchants may not separately collect sales tax from buyers for Catholic Owned® Marketplace transactions unless Catholic Owned® gives prior written approval.",
      "Merchants are responsible for providing accurate product categories, product descriptions, taxability information, exemption information, shipping information, business information, and any other information Catholic Owned® or the Payment Processor or the Tax Calculation Provider may request to determine tax treatment.",
      "Catholic Owned® may rely on information provided by Merchants and the Tax Calculation Provider's calculations, classifications, and processes to determine product taxability, exemptions, and applicable sales tax treatment. Merchants are responsible for any tax adjustment, penalty, assessment, loss, or cost arising from inaccurate, incomplete, misleading, or outdated information provided by the Merchant. In the event that a tax assessment, penalty, or undercollection arises from an error in the Tax Calculation Provider's platform or calculations that is not attributable to inaccurate or incomplete information provided by the Merchant, the parties agree to cooperate in good faith to determine the appropriate allocation of such liability. Nothing in this section limits Catholic Owned, PBC's obligations to tax authorities as marketplace facilitator or merchant of record.",
      "Merchants remain responsible for their own tax obligations, including income taxes, business taxes, reporting obligations, and any taxes not collected or remitted by Catholic Owned, PBC.",
    ],
  },
  {
    title: "21. Buyer Communication",
    blocks: [
      "Merchants must communicate with buyers professionally, promptly, and respectfully through the Catholic Owned® platform, approved messaging tools, account email, or other communication method designated by Catholic Owned®.",
      "Merchants may not use buyer information obtained through Catholic Owned® to circumvent the Catholic Owned® Marketplace, solicit off-platform transactions, send unauthorized marketing, or contact buyers for purposes unrelated to the buyer's order unless expressly permitted by Catholic Owned®.",
    ],
  },
  {
    title: "22. Buyer Data and Privacy",
    blocks: [
      "Merchants are responsible for protecting buyer information they receive or process through the Catholic Owned® Marketplace and must comply with all applicable privacy, data protection, consumer protection, and information security laws.",
      "When a Merchant receives buyer information, including a buyer's name, email address, shipping address, order details, or messages, the Merchant may use that information only to fulfill the buyer's order, communicate about the order, process returns or replacements, resolve order issues, comply with legal obligations, and complete Catholic Owned® Marketplace-facilitated transactions.",
      "Merchants may not add buyers to email lists, send marketing messages, sell buyer information, use buyer identity for marketing, solicit off-platform transactions, retain buyer information longer than reasonably necessary, or use buyer information for any purpose unrelated to the Catholic Owned® Marketplace transaction without the buyer's express consent.",
      "Merchants may not collect, request, store, or process buyer payment card information outside the Catholic Owned® platform or approved payment processor systems.",
      "To the extent a Merchant determines the purposes or means of processing buyer personal information outside the Catholic Owned® platform, the Merchant is responsible for complying with applicable privacy and data protection laws and for honoring any legally required access, correction, deletion, portability, objection, opt-out, or similar consumer rights requests.",
      "This includes, without limitation, compliance with the California Consumer Privacy Act (CCPA) and its regulations, the General Data Protection Regulation (GDPR) to the extent applicable to the Merchant's processing of EU residents' personal data, and any other applicable federal, state, or international privacy laws. Merchants who sell to buyers in the European Union or European Economic Area should be aware that they may be considered independent data controllers under the GDPR and may have additional legal obligations, including maintaining their own privacy policy and honoring data subject rights requests.",
      "Merchants must use reasonable administrative, technical, and physical safeguards to protect buyer information from unauthorized access, use, disclosure, alteration, loss, or destruction.",
      "Merchants must promptly notify Catholic Owned® at support@catholicowned.com of any actual or suspected unauthorized access, disclosure, loss, misuse, breach, or compromise involving buyer information.",
      "If a Merchant discloses, misuses, loses, improperly retains, or improperly processes buyer information, the Merchant is responsible for any resulting claims, losses, costs, penalties, investigations, notices, remediation, damages, or expenses, including any costs incurred by Catholic Owned®.",
    ],
  },
  {
    title: "23. Off-Platform Transactions",
    blocks: [
      "Merchants may not encourage buyers to complete purchases outside the Catholic Owned® Marketplace, provide external checkout links for listed products, request direct payment, or use Catholic Owned® buyer relationships to avoid Catholic Owned® fees.",
      "Merchants may not use Catholic Owned® messages, listings, buyer data, order information, or marketplace relationships to redirect buyers to another website, marketplace, social media account, payment method, or ordering process for the purpose of avoiding Catholic Owned® fees or policies.",
      "Violation of this section may result in account restriction, loss of selling privileges, payout offsets, suspension, termination, or other action Catholic Owned® deems appropriate.",
    ],
  },
  {
    title: "24. Reviews and Review Integrity",
    blocks: [
      "Merchants may not manipulate reviews, offer compensation for positive reviews, post fake reviews, pressure buyers to change reviews, or use separate accounts to inflate ratings or harm another Merchant.",
      "Merchants may not threaten, harass, intimidate, shame, or retaliate against buyers for leaving honest feedback.",
      "Catholic Owned® may remove, suppress, reject, or moderate reviews or review responses that Catholic Owned® determines are false, misleading, abusive, obscene, discriminatory, irrelevant, manipulated, retaliatory, or otherwise inconsistent with Catholic Owned® policies.",
    ],
  },
  {
    title: "25. Search Ranking, Visibility, and Marketplace Placement",
    blocks: [
      "Catholic Owned® may determine, modify, limit, boost, suppress, reorder, or remove the visibility of Merchants, products, categories, or listings in search results, category pages, recommendations, guides, advertisements, emails, app features, website features, or other placements at its sole discretion.",
      "Catholic Owned® does not guarantee any particular search ranking, placement, visibility, traffic, exposure, promotion, or sales result.",
      "Catholic Owned® may consider various factors when determining visibility or placement, including product quality, listing completeness, buyer demand, fulfillment performance, Merchant tier, Catholic Owned® priorities, category relevance, seasonal relevance, policy compliance, risk concerns, buyer experience, and other factors Catholic Owned® deems relevant.",
    ],
  },
  {
    title: "26. No Guarantee of Sales or Promotion",
    blocks: [
      "Catholic Owned® does not guarantee sales, traffic, exposure, search placement, featured placement, promotion, revenue, profit, or any specific business result.",
      "Catholic Owned® may choose to promote certain Merchants, products, categories, guides, collections, or listings through emails, social media, website features, app features, advertisements, livestreams, or other marketing channels. No Merchant is guaranteed promotion.",
    ],
  },
  {
    title: "27. License to Use Merchant Content",
    blocks: [
      "By submitting product listings, photos, descriptions, logos, trademarks, business names, images, videos, or other content to Catholic Owned®, you grant Catholic Owned® a worldwide, non-exclusive, royalty-free license to use, display, reproduce, distribute, modify, resize, crop, publish, promote, and create derivative works from that content for purposes related to operating, marketing, promoting, and improving Catholic Owned® and the Catholic Owned® Marketplace.",
      "This includes use in product pages, search results, category pages, guides, emails, social media, advertisements, app features, website features, livestreams, press materials, and other promotional or operational materials.",
      "Derivative works created under this license will not be used in a manner that materially misrepresents the original product or the Merchant's brand. Upon termination of a Merchant's account, this license shall continue only with respect to content already published or incorporated into existing promotional materials. Catholic Owned® will make commercially reasonable efforts to remove Merchant content from active marketing materials following account termination upon the Merchant's written request.",
      "You represent that you have all rights necessary to grant this license.",
    ],
  },
  {
    title: "28. Intellectual Property",
    blocks: [
      "Catholic Owned®, the Catholic Owned® name, Catholic Owned® mark, logos, designs, website, app, Catholic Owned® Marketplace, content, software, trade dress, and related intellectual property are owned by Catholic Owned, PBC or its licensors.",
      "Merchants may not use Catholic Owned® intellectual property except as expressly authorized in writing by Catholic Owned®.",
      "Merchants retain ownership of their own lawful business names, logos, product photos, product descriptions, and other Merchant content, subject to the license granted to Catholic Owned® in these Merchant Terms.",
    ],
  },
  {
    title: "28A. Copyright Infringement and DMCA Policy",
    blocks: [
      "Catholic Owned® respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512. Catholic Owned® maintains a designated agent to receive notices of claimed copyright infringement and will respond to valid takedown notices in accordance with applicable law.",
      "If you believe that content on the Catholic Owned® Marketplace infringes your copyright, please send a written notice to Catholic Owned®'s designated copyright agent at support@catholicowned.com containing the following: (1) identification of the copyrighted work claimed to be infringed; (2) identification of the allegedly infringing material and its location on the Marketplace; (3) your contact information; (4) a statement that you have a good faith belief that the use is not authorized by the copyright owner; (5) a statement that the information in the notice is accurate and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner; and (6) your physical or electronic signature.",
      "Merchants whose content is removed pursuant to a DMCA takedown notice may submit a counter-notification to Catholic Owned® if they believe the removal was made in error. Catholic Owned® will process counter-notifications in accordance with applicable law.",
      "Merchants who repeatedly infringe third-party intellectual property rights are subject to account suspension or termination.",
    ],
  },
  {
    title: "29. Compliance with Law",
    blocks: [
      "Merchants are responsible for complying with all applicable laws, regulations, rules, and industry standards related to their products, listings, business operations, taxes, advertising, consumer protection, privacy, intellectual property, safety, labeling, shipping, and fulfillment.",
      "Merchants may not list, sell, ship, or promote any product that is illegal, restricted, unsafe, recalled, counterfeit, infringing, or otherwise prohibited by Catholic Owned®, the Payment Processor, the Tax Calculation Provider, applicable law, or payment processor rules.",
    ],
  },
  {
    title: "30. Product Liability and Insurance",
    blocks: [
      "Merchants are responsible for the safety, legality, quality, labeling, warnings, instructions, packaging, and suitability of the products they list, sell, or ship through the Catholic Owned® Marketplace.",
      "Merchants who list products in the following Restricted Product categories are required to maintain commercially reasonable product liability insurance and general liability insurance as a condition of listing approval and continued participation in the Catholic Owned® Marketplace: wine and alcohol-related products; food and beverage products; vitamins, supplements, and products making health or wellness claims; children's products; candles and other open-flame products; cosmetics and skincare products. Catholic Owned® may expand this list of required insurance categories by providing Merchants with at least thirty (30) days' written notice.",
      "Catholic Owned® also may require Merchants in other categories, either generally or for certain product categories, to maintain commercially reasonable insurance coverage, including product liability insurance, general liability insurance, liquor liability insurance where applicable, or other coverage Catholic Owned® determines is appropriate.",
      "Catholic Owned® may require proof of insurance as a condition of approval, continued participation, listing approval, restricted product approval, payout release, or continued access to the Catholic Owned® Marketplace.",
      "Failure to maintain required insurance or provide proof of coverage upon request may result in listing removal, payout delay, reserves, account restriction, suspension, or termination.",
    ],
  },
  {
    title: "31. Confidentiality",
    blocks: [
      "During participation in the Catholic Owned® Marketplace, Merchants may receive access to nonpublic information about Catholic Owned®, the Catholic Owned® Marketplace, buyers, marketplace operations, product plans, pricing, promotions, platform features, business processes, policies, technical systems, data, or other confidential or proprietary information.",
      "Merchants agree to use confidential information only as necessary to participate in the Catholic Owned® Marketplace and to protect such information from unauthorized access, use, or disclosure.",
      "Merchants may not disclose Catholic Owned® confidential information to any third party except as required by law or with Catholic Owned®'s prior written consent.",
      "Confidential information does not include information that becomes publicly available through no fault of the Merchant, was lawfully known by the Merchant before disclosure, or is independently developed by the Merchant without use of Catholic Owned® confidential information.",
    ],
  },
  {
    title: "32. Account Suspension and Termination",
    blocks: [
      "Catholic Owned® may suspend, restrict, or terminate a Merchant account at any time, with or without notice, if Catholic Owned® determines that the Merchant has violated these Merchant Terms, violated Catholic Owned®'s values or policies, created risk for buyers, created risk for Catholic Owned®, failed to fulfill orders, failed to communicate, listed prohibited products, failed to satisfy restricted product requirements, infringed third-party rights, engaged in fraud, attempted to circumvent Catholic Owned® fees, misused buyer data, manipulated reviews, or otherwise acted inconsistently with the mission or standards of Catholic Owned®.",
      "Upon suspension or termination, Catholic Owned® may remove listings, cancel pending orders, process refunds, delay payouts, establish or maintain reserves, offset losses, restrict platform access, or take other actions Catholic Owned® deems appropriate.",
      "No refund will be provided for suspended or terminated accounts, except where Catholic Owned® determines otherwise or where required by applicable law.",
    ],
  },
  {
    title: "33. Indemnification",
    blocks: [
      "You agree to defend, indemnify, and hold harmless Catholic Owned, PBC and its officers, directors, employees, contractors, agents, affiliates, partners, successors, and assigns from and against any claims, damages, losses, liabilities, penalties, settlements, costs, and expenses, including reasonable attorneys' fees, arising out of or related to:",
      {
        list: [
          "Your products or listings.",
          "Your fulfillment, shipping, returns, replacements, or buyer communications.",
          "Your breach of these Merchant Terms.",
          "Your violation of law.",
          "Your violation of Catholic Owned® policies.",
          "Your infringement or alleged infringement of any third-party rights.",
          "Your misuse, disclosure, loss, or improper processing of buyer information.",
          "Your pricing, discounts, promotions, product claims, safety claims, labels, warnings, or disclosures.",
          "Any product liability claim, injury, damage, illness, loss, defect, recall, safety issue, or regulatory issue arising from your products.",
          "Any claim, loss, penalty, tax, fee, regulatory issue, licensing issue, carrier issue, or age-verification issue arising from restricted products, including wine or other regulated goods.",
          "Your misconduct, negligence, fraud, misrepresentation, or failure to perform.",
          "Any claim, fine, penalty, or proceeding brought by a governmental authority, regulatory agency, or law enforcement body arising from your products, listings, business conduct, or violations of applicable law.",
        ],
      },
    ],
  },
  {
    title: "34. Disclaimer of Warranties",
    blocks: [
      'The Catholic Owned® Marketplace is provided on an "as is" and "as available" basis.',
      "Catholic Owned® makes no warranties or guarantees regarding marketplace availability, uninterrupted service, sales, revenue, buyer demand, search ranking, promotional placement, platform performance, payment processor availability, tax calculation availability, third-party service availability, or any specific business outcome.",
      "To the fullest extent permitted by law, Catholic Owned® disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, title, course of performance, and course of dealing.",
    ],
  },
  {
    title: "35. Limitation of Liability",
    blocks: [
      "To the fullest extent permitted by law, Catholic Owned, PBC shall not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, including lost profits, lost revenue, lost business opportunities, loss of data, business interruption, reputational harm, or other intangible losses arising out of or related to these Merchant Terms or your participation in the Catholic Owned® Marketplace.",
      "To the fullest extent permitted by law, Catholic Owned, PBC's total liability to any Merchant shall not exceed the greater of (a) the total amount of fees paid by that Merchant to Catholic Owned, PBC during the six (6) months immediately preceding the event giving rise to the claim, or (b) five hundred dollars ($500.00).",
      "Notwithstanding the foregoing, nothing in this Section 35 shall limit Catholic Owned, PBC's liability arising from its own fraud, willful misconduct, or gross negligence.",
      "Nothing in these Merchant Terms shall limit liability where such limitation is prohibited by applicable law.",
    ],
  },
  {
    title: "36. Changes to These Merchant Terms",
    blocks: [
      "Catholic Owned® may update these Merchant Terms from time to time.",
      "If changes are material, Catholic Owned® will provide at least thirty (30) days' notice by email, platform notification, website posting, or other reasonable means prior to the effective date of such changes. Continued participation in the Catholic Owned® Marketplace after updated terms become effective constitutes acceptance of the updated Merchant Terms.",
    ],
  },
  {
    title: "37. Legal Notices",
    blocks: [
      "Catholic Owned® may provide notices to Merchants by email to the address associated with the Merchant account, through the Catholic Owned® platform, by posting on the Catholic Owned® website, or by any other reasonable method.",
      "Unless otherwise required by law, notices sent by email or platform notification are effective when sent, and notices posted to the Catholic Owned® website are effective when posted.",
      "Merchants must send legal notices to Catholic Owned® by email at support@catholicowned.com, unless Catholic Owned® provides another method for a particular type of notice.",
      "Merchants are responsible for keeping account contact information accurate and up to date.",
    ],
  },
  {
    title: "38. Governing Law",
    blocks: [
      "These Merchant Terms shall be governed by and interpreted in accordance with the laws of the State of Delaware, without regard to conflict of law principles.",
      "Any dispute arising out of or related to these Merchant Terms, the Catholic Owned® Marketplace, or Merchant participation in the Catholic Owned® Marketplace shall be resolved according to the dispute resolution provisions below.",
      "Catholic Owned® may seek injunctive or equitable relief in any court of competent jurisdiction where necessary to protect its intellectual property, confidential information, buyer data, payment systems, platform security, marketplace integrity, unpaid amounts, Catholic Owned®'s mission and Catholic standards, or to prevent misuse of the Catholic Owned® Marketplace.",
    ],
  },
  {
    title:
      "39. Dispute Resolution, Arbitration, Class Action Waiver, and Jury Trial Waiver",
    blocks: [
      "Before initiating arbitration or litigation, the parties agree to attempt in good faith to resolve any dispute informally. A party seeking to raise a dispute must first provide written notice describing the nature of the dispute, the relief requested, and relevant supporting information. The parties will attempt to resolve the dispute through informal negotiation for at least thirty (30) days after notice is received, unless urgent equitable relief is reasonably necessary.",
      'Except for claims that qualify for small claims court and claims for injunctive or equitable relief, any dispute, claim, or controversy arising out of or relating to these Merchant Terms, the Catholic Owned® Marketplace, Merchant participation, fees, payouts, products, listings, or the relationship between the parties shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules then in effect. The arbitration shall be conducted by a single arbitrator. The seat of arbitration shall be Wilmington, Delaware. Each party shall bear its own attorneys\' fees and costs unless the arbitrator determines otherwise. The arbitrator\'s award shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.',
      "The arbitration shall be conducted on an individual basis. Merchants and Catholic Owned® waive the right to participate in a class action, collective action, representative action, private attorney general action, or consolidated proceeding to the fullest extent permitted by law.",
      "To the fullest extent permitted by law, Merchants and Catholic Owned® waive the right to a jury trial for any dispute arising out of or relating to these Merchant Terms or the Catholic Owned® Marketplace.",
      "Catholic Owned® may seek injunctive or equitable relief in any court of competent jurisdiction to protect intellectual property, confidential information, buyer data, marketplace integrity, payment systems, platform security, Catholic Owned®'s mission and standards, or to prevent misuse of the Catholic Owned® Marketplace.",
      "Arbitration Opt-Out: A Merchant who does not wish to be bound by the arbitration and class action waiver provisions of this Section 39 may opt out by sending written notice to Catholic Owned® at support@catholicowned.com within thirty (30) days of first accepting these Merchant Terms. The opt-out notice must include the Merchant's name, business name, and email address associated with the Merchant account. If a Merchant opts out, disputes will be resolved in the state or federal courts located in Wilmington, Delaware, and the Merchant consents to personal jurisdiction and venue in those courts. Opting out of arbitration does not affect any other provision of these Merchant Terms.",
    ],
  },
  {
    title: "40. Assignment",
    blocks: [
      "Merchants may not assign, transfer, delegate, sell, or otherwise convey their Merchant account, rights, payouts, or obligations under these Merchant Terms without Catholic Owned®'s prior written consent.",
      "Catholic Owned® may assign or transfer these Merchant Terms, in whole or in part, in connection with a merger, acquisition, reorganization, sale of assets, financing, change of control, corporate restructuring, or operation of law.",
    ],
  },
  {
    title: "41. Force Majeure",
    blocks: [
      "Catholic Owned® will not be liable for any delay, failure, interruption, or inability to perform resulting from circumstances beyond its reasonable control, including acts of God, natural disasters, war, terrorism, civil unrest, labor disputes, supply chain disruptions, shipping carrier failures, payment processor failures, banking network failures, the Tax Calculation Provider's service interruptions, internet or telecommunications outages, cyberattacks, governmental actions, changes in law, pandemics, or other events beyond Catholic Owned®'s reasonable control.",
      "This section does not relieve Merchants of responsibility for amounts owed to Catholic Owned® or for obligations that can reasonably be performed despite the force majeure event.",
    ],
  },
  {
    title: "42. Relationship of the Parties",
    blocks: [
      "Nothing in these Merchant Terms creates a partnership, joint venture, employment relationship, franchise, agency relationship, or fiduciary relationship between Catholic Owned® and any Merchant.",
      "Merchants are independent businesses responsible for their own products, operations, taxes, compliance, and obligations, except where Catholic Owned, PBC expressly assumes responsibility under these Merchant Terms or applicable law.",
    ],
  },
  {
    title: "43. Survival",
    blocks: [
      "Any provisions that by their nature should survive termination will survive termination, suspension, account closure, or expiration of these Merchant Terms.",
      "Surviving provisions include, without limitation, provisions regarding fees owed, reimbursement, offsets, reserves, refunds, chargebacks, buyer data and privacy, confidentiality, intellectual property, license to use Merchant content, product liability, insurance, indemnification, disclaimer of warranties, limitation of liability, dispute resolution, arbitration, governing law, legal notices, assignment, and any other obligations that accrued before termination.",
    ],
  },
  {
    title: "44. Severability",
    blocks: [
      "If any provision of these Merchant Terms is found to be invalid, unlawful, or unenforceable, that provision will be modified and interpreted to accomplish the objectives of the provision to the greatest extent permitted by law, and the remaining provisions will remain in full force and effect.",
    ],
  },
  {
    title: "45. No Waiver",
    blocks: [
      "Catholic Owned®'s failure to enforce any provision of these Merchant Terms does not constitute a waiver of that provision or any other provision. Any waiver must be in writing and signed by an authorized representative of Catholic Owned®.",
    ],
  },
  {
    title: "46. Interpretation",
    blocks: [
      'Section headings are for convenience only and do not affect interpretation. Words such as "including" and "including without limitation" are illustrative and not limiting.',
    ],
  },
  {
    title: "47. Electronic Acceptance",
    blocks: [
      "By applying to sell, creating a Merchant account, clicking to accept, listing products, accepting orders, receiving payouts, or continuing to participate in the Catholic Owned® Marketplace, you agree that you have electronically accepted these Merchant Terms and that such acceptance has the same legal effect as a physical signature.",
    ],
  },
  {
    title: "48. Entire Agreement",
    blocks: [
      "These Merchant Terms, together with any applicable Catholic Owned® policies, onboarding materials, general website terms, privacy policy, return and refund policies, prohibited and restricted products policies, shipping policies, payment processor terms, tax processing requirements, and other written requirements provided to or accepted by the Merchant, constitute the agreement between Catholic Owned® and the Merchant regarding Merchant participation in the Catholic Owned® Marketplace.",
    ],
  },
  {
    title: "49. Contact",
    blocks: [
      "Questions about these Merchant Terms may be directed to:",
      "Catholic Owned, PBC",
      "Email: support@catholicowned.com",
      "Website: www.catholicowned.com",
    ],
  },
]

export default function MerchantTermsPage() {
  return (
    <main className="bg-white min-h-screen py-16 lg:py-24">
      <article className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-[#BE9B32] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Catholic Owned, PBC
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#17294A] uppercase mb-3">
            Merchant Terms of Service
          </h1>
          <p className="text-sm text-[#44474e]">
            Effective Date: {EFFECTIVE_DATE}
          </p>
        </div>

        {SECTIONS.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.blocks.map((block, i) =>
              typeof block === "string" ? (
                <p key={i}>{block}</p>
              ) : (
                <ul key={i}>
                  {block.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </Section>
        ))}
      </article>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl lg:text-2xl font-bold text-[#17294A] mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-[#44474e] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#BE9B32] [&_a]:underline">
        {children}
      </div>
    </section>
  )
}
