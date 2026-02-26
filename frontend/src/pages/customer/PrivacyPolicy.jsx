import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#faf8f4' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center gap-2 mb-8 font-medium transition-colors" style={{ color: '#9a8e7f' }}>
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>

                <div className="rounded-2xl p-8 md:p-12" style={{ background: '#fff', border: '1px solid #ede5d8', boxShadow: '0 4px 20px rgba(42,36,28,0.05)' }}>
                    <h1 className="font-display text-4xl font-bold mb-2" style={{ color: '#2a241c' }}>Privacy Policy</h1>
                    <p className="mb-8 text-sm" style={{ color: '#9a8e7f' }}>Last updated: February 26, 2026</p>

                    <div className="space-y-8" style={{ color: '#4a3f33' }}>
                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>1. Introduction</h2>
                            <p className="leading-relaxed">
                                Welcome to Lovely Gifts ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>lovelygifts.co.in</strong> and use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>2. Information We Collect</h2>
                            <p className="leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address when you create an account or place an order.</li>
                                <li><strong>Payment Information:</strong> Payment details are processed securely through PhonePe payment gateway. We do not store your card details on our servers.</li>
                                <li><strong>Order Information:</strong> Details of products you purchase, customization preferences, and order history.</li>
                                <li><strong>Communication Data:</strong> Messages you send to us, reviews, and feedback.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To process and fulfill your orders, including customization and delivery.</li>
                                <li>To communicate with you about your orders, account, and promotions.</li>
                                <li>To improve our website, products, and customer service.</li>
                                <li>To detect and prevent fraud or unauthorized access.</li>
                                <li>To comply with legal obligations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>4. Information Sharing</h2>
                            <p className="leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments (PhonePe), and delivering orders. These parties are obligated to keep your information confidential.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>5. Data Security</h2>
                            <p className="leading-relaxed">
                                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted and processed through PhonePe's secure payment infrastructure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>6. Cookies</h2>
                            <p className="leading-relaxed">
                                Our website uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>7. Your Rights</h2>
                            <p className="leading-relaxed mb-3">You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access and receive a copy of your personal data.</li>
                                <li>Rectify or update your personal information.</li>
                                <li>Request deletion of your personal data.</li>
                                <li>Opt-out of marketing communications at any time.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>8. Children's Privacy</h2>
                            <p className="leading-relaxed">
                                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>9. Changes to This Policy</h2>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>10. Contact Us</h2>
                            <p className="leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:<br />
                                <strong>Email:</strong> hello@lovelygifts.com<br />
                                <strong>Address:</strong> Kitha Bath Khan St, SVM Nagar, Ellis Puram, Triplicane, Chennai, Tamil Nadu 600005
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
