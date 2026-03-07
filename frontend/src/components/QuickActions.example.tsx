/**
 * QuickActions Component Usage Example
 * 
 * This file demonstrates how to use the QuickActions component
 * in your application.
 */

import React from 'react';
import { QuickActions } from './QuickActions';
import type { Language } from '../types';

export function QuickActionsExample() {
  const [language, setLanguage] = React.useState<Language>('hi');

  const handleActionClick = (query: string) => {
    console.log('Quick action clicked:', query);
    // In a real application, you would:
    // 1. Send the query to your chat handler
    // 2. Display the query in the chat interface
    // 3. Trigger the API call to get a response
    
    // Example:
    // sendMessage(query);
    // or
    // onQuerySubmit(query);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '430px', margin: '0 auto' }}>
      <h2>QuickActions Component Demo</h2>
      
      {/* Language Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}>
          Switch to {language === 'hi' ? 'English' : 'हिंदी'}
        </button>
      </div>

      {/* QuickActions Component */}
      <QuickActions 
        language={language} 
        onActionClick={handleActionClick} 
      />

      {/* Usage Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Usage:</h3>
        <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
{`import { QuickActions } from './components/QuickActions';

function ChatInterface() {
  const [language, setLanguage] = useState<Language>('hi');
  
  const handleActionClick = (query: string) => {
    // Send query to chat
    sendMessage(query);
  };
  
  return (
    <QuickActions 
      language={language}
      onActionClick={handleActionClick}
    />
  );
}`}
        </pre>
      </div>
    </div>
  );
}
