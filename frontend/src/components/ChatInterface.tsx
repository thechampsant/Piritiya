import React, { useState, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageList } from './MessageList';
import { VoiceInput } from './VoiceInput';
import { VoiceOutput } from './VoiceOutput';
import { QuickActions } from './QuickActions';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const { state: chatState, sendMessage } = useChatContext();
  const { state: appState } = useApp();
  const { t } = useLanguage();
  
  const [inputText, setInputText] = useState('');
  const [currentBotResponse, setCurrentBotResponse] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript);
    handleSubmit(transcript);
  };

  // Handle message submission
  const handleSubmit = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || chatState.isLoading) return;

    setInputText('');
    setShowRetry(false);
    setCurrentBotResponse(null);

    try {
      await sendMessage(messageText);
      
      // Get the latest bot response for voice output
      const latestMessage = chatState.messages[chatState.messages.length - 1];
      if (latestMessage && latestMessage.sender === 'bot' && appState.voiceEnabled) {
        setCurrentBotResponse(latestMessage.text);
      }
    } catch (error) {
      setShowRetry(true);
    }
  };

  // Handle quick action click
  const handleQuickAction = (query: string) => {
    handleSubmit(query);
  };

  // Handle retry
  const handleRetry = () => {
    if (chatState.messages.length > 0) {
      const lastUserMessage = [...chatState.messages]
        .reverse()
        .find(m => m.sender === 'user');
      if (lastUserMessage) {
        handleSubmit(lastUserMessage.text);
      }
    }
  };

  // Handle voice output complete
  const handleVoiceComplete = () => {
    setCurrentBotResponse(null);
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-soil-dark to-soil ${className}`}>
      {/* Offline Indicator */}
      {!appState.isOnline && (
        <div 
          className="flex items-center gap-2 px-4 py-2 bg-sky-blue/10 border-b border-sky-blue/25"
          role="status"
          aria-live="polite"
        >
          <div className="w-2 h-2 rounded-full bg-sky-blue" />
          <span className="text-sky-blue text-sm">
            {t('offline_mode')}
          </span>
        </div>
      )}

      {/* Message List - Scrollable Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={chatState.messages}
          language={appState.language}
        />
      </div>

      {/* Error Message with Retry */}
      {(chatState.error || showRetry) && (
        <div 
          className="mx-4 mb-2 p-3 bg-alert-bg border border-alert/40 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-alert text-sm font-semibold mb-1">
                {t('error_occurred')}
              </p>
              <p className="text-cream/70 text-xs">
                {chatState.error || t('request_failed')}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-alert/20 hover:bg-alert/30 border border-alert/50 rounded-md text-alert text-xs font-semibold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('retry')}
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <QuickActions 
          language={appState.language}
          onActionClick={handleQuickAction}
        />
      </div>

      {/* Input Area */}
      <div className="border-t border-gold/25 bg-soil/95 backdrop-blur-sm">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2 p-4">
          {/* Voice Input */}
          <div className="flex-shrink-0">
            <VoiceInput
              language={appState.language}
              onTranscript={handleVoiceTranscript}
              disabled={chatState.isLoading}
            />
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('type_message')}
              disabled={chatState.isLoading}
              className="w-full px-4 py-3 bg-cream/10 border border-gold/25 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              aria-label={t('message_input')}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || chatState.isLoading}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] px-4 py-3 bg-gradient-to-br from-terracotta-light to-terracotta hover:from-terracotta hover:to-clay disabled:from-clay/50 disabled:to-clay/30 rounded-lg text-cream font-semibold transition-all disabled:cursor-not-allowed shadow-lg disabled:shadow-none flex items-center justify-center"
            aria-label={t('send_message')}
          >
            {chatState.isLoading ? (
              <div className="flex gap-1" aria-label={t('loading')}>
                <div className="w-1.5 h-1.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <span className="text-lg">📤</span>
            )}
          </button>
        </form>
      </div>

      {/* Voice Output */}
      {currentBotResponse && appState.voiceEnabled && (
        <VoiceOutput
          text={currentBotResponse}
          language={appState.language}
          autoPlay={true}
          onComplete={handleVoiceComplete}
        />
      )}
    </div>
  );
};

export default ChatInterface;
