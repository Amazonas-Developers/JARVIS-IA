import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ConfigPanel from '@/components/config/ConfigPanel';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useConnection } from '@/hooks/useConnection';
import { useSettings } from '@/hooks/useSettings';
import { env } from '@/libs/env';
import { normalizeBaseUrl } from '@/libs/lmStudio';

/* Ruta /dashboard: el cliente de chat con LM Studio (toda la app original). */
export default function DashboardPage() {
  const settings = useSettings();
  const connection = useConnection();
  const chat = useChat();
  const [model, setModel] = useState('');
  const autoTestedRef = useRef(false);

  const handleTestConnection = async () => {
    const result = await connection.test(env.serverUrl);
    if (!result.ok && result.errorMessage) {
      chat.notify(
        'error',
        `No se pudo conectar con ${result.baseUrl}. Verifica: 1) que LM Studio tenga el servidor local activado, ` +
          '2) que la IP y puerto de VITE_LM_STUDIO_URL (archivo .env) sean correctos, ' +
          '3) que ambas computadoras estén en la misma red, ' +
          `4) que el firewall permita el puerto (${result.errorMessage}).`,
      );
    }
  };

  // Comprueba la conexión automáticamente al cargar.
  useEffect(() => {
    if (autoTestedRef.current) return;
    autoTestedRef.current = true;
    void handleTestConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando llega la lista de modelos, selecciona el primero si el actual no existe.
  useEffect(() => {
    if (connection.models.length === 0) {
      setModel('');
    } else if (!connection.models.includes(model)) {
      setModel(connection.models[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.models]);

  const handleSend = (text: string) => {
    void chat.sendMessage(text, {
      baseUrl: normalizeBaseUrl(env.serverUrl),
      model,
      temperature: env.temperature,
      maxTokens: env.maxTokens,
      webSearch: settings.webSearchEnabled ? { apiKey: env.tavilyKey } : null,
    });
  };

  return (
    <div className="flex h-full flex-row">
      <Sidebar
        conversations={chat.conversations}
        currentId={chat.currentId}
        onNewConversation={chat.startNewConversation}
        onSelectConversation={chat.loadConversation}
        onDeleteConversation={chat.deleteConversation}
        onExport={chat.exportConversations}
        onImportFile={chat.importConversations}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Header
          connectionState={connection.state}
          statusText={connection.statusText}
        />

        <ConfigPanel
          models={connection.models}
          model={model}
          onModelChange={setModel}
          connectionState={connection.state}
          isChecking={connection.isChecking}
          onTestConnection={() => void handleTestConnection()}
          onClearConversation={chat.clearCurrentConversation}
          webSearchEnabled={settings.webSearchEnabled}
          onWebSearchEnabledChange={settings.setWebSearchEnabled}
          hasTavilyKey={env.tavilyKey !== ''}
        />

        <ChatWindow messages={chat.uiMessages} />

        <ChatInput isSending={chat.isSending} onSend={handleSend} />
      </div>
    </div>
  );
}
