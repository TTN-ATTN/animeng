import WaifuChatContainer from './components/waifu-chat-container';

const ChatPage = async () => {
    return (
        <div className="h-full max-w-[912px] mx-auto px-3">
            <h1 className="text-2xl font-bold text-neutral-700 mt-12 mb-6">Trò chuyện cùng với gái alimi</h1>
            <WaifuChatContainer />
        </div>
    )
}

export default ChatPage;
