const Contact = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                    <p className="text-gray-600 mb-6">
                        We'd love to hear from you! Whether you have a question about our products, pricing, or need help with a custom order, our team is ready to answer all your questions.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <strong>Email:</strong> <span>hello@lovelygifts.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <strong>Phone:</strong> <span>+1 (234) 567-8900</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <strong>Address:</strong> <span>123 Gift Avenue, Suite 100<br />San Francisco, CA 94110</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
