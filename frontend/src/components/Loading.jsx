const Loading = ({ size = 'default' }) => {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        default: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div className={`${sizeClasses[size]} border-white/10 border-t-primary-500 rounded-full animate-spin`} />
        </div>
    );
};

export const PageLoading = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-400 animate-pulse">Loading...</p>
            </div>
        </div>
    );
};

export default Loading;
