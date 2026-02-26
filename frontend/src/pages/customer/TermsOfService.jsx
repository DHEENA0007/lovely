import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#faf8f4' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center gap-2 mb-8 font-medium transition-colors" style={{ color: '#9a8e7f' }}>
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>

                <div className="rounded-2xl p-8 md:p-12" style={{ background: '#fff', border: '1px solid #ede5d8', boxShadow: '0 4px 20px rgba(42,36,28,0.05)' }}>
                    <h1 className="font-display text-4xl font-bold mb-2" style={{ color: '#2a241c' }}>Terms of Service</h1>
                    <p className="mb-8 text-sm" style={{ color: '#9a8e7f' }}>Last updated: February 26, 2026</p>

                    <div className="space-y-8" style={{ color: '#4a3f33' }}>
                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>1. Agreement to Terms</h2>
                            <p className="leading-relaxed">
                                By accessing and using the Lovely Gifts website (<strong>lovelygifts.co.in</strong>), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>2. Products and Services</h2>
                            <p className="leading-relaxed mb-3">
                                Lovely Gifts offers personalized and customized gift products including photo frames, mugs, and other gift items. We reserve the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Modify or discontinue any product without prior notice.</li>
                                <li>Limit the quantity of products available for purchase.</li>
                                <li>Refuse service to anyone for any reason at any time.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>3. Pricing and Payment</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
                                <li>We reserve the right to change prices at any time without prior notice.</li>
                                <li>Payments are processed securely through PhonePe payment gateway or Cash on Delivery (COD).</li>
                                <li>Orders will be confirmed only after successful payment verification.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>4. Customization Policy</h2>
                            <p className="leading-relaxed">
                                For customized products, please ensure that all text, photos, and design preferences are correct before placing your order. Once a customized order has been processed or is in production, modifications or cancellations may not be possible. We are not responsible for errors in customer-provided content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>5. Shipping and Delivery</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>We aim to ship all orders within 2-5 business days of order confirmation.</li>
                                <li>Delivery timelines may vary depending on your location and product customization requirements.</li>
                                <li>Free shipping is available for orders above ₹999. A shipping fee of ₹99 applies to orders below this amount.</li>
                                <li>We are not responsible for delays caused by shipping carriers or unforeseen circumstances.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>6. Returns and Refunds</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Customized products are non-returnable and non-refundable unless they arrive damaged or defective.</li>
                                <li>If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos of the damage.</li>
                                <li>Refunds for eligible returns will be processed within 7-10 business days after we receive the returned item.</li>
                                <li>Non-customized products may be returned within 7 days of delivery in their original packaging.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>7. Order Cancellation</h2>
                            <p className="leading-relaxed">
                                Orders can be cancelled before they enter production. Once production has started, especially for customized items, cancellation may not be possible. For COD orders, repeated cancellations may result in restriction of COD payment option for your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>8. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content on the Lovely Gifts website, including images, logos, text, and designs, is the property of Lovely Gifts and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>9. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                <li>You agree to provide accurate and complete information when creating an account.</li>
                                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>10. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                Lovely Gifts shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the specific product or service in question.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>11. Governing Law</h2>
                            <p className="leading-relaxed">
                                These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3" style={{ color: '#2a241c' }}>12. Contact Us</h2>
                            <p className="leading-relaxed">
                                If you have any questions about these Terms of Service, please contact us at:<br />
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

export default TermsOfService;
