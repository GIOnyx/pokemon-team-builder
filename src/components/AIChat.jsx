import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Loader2, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import { startOrContinueChat, resetChat } from '../services/gemini';
import { fetchPokemonDetails } from '../services/pokeApi';
import ReactMarkdown from 'react-markdown';

const typeColors = {
  normal: 'var(--type-normal)', fire: 'var(--type-fire)', water: 'var(--type-water)',
  electric: 'var(--type-electric)', grass: 'var(--type-grass)', ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison: 'var(--type-poison)', ground: 'var(--type-ground)',
  flying: 'var(--type-flying)', psychic: 'var(--type-psychic)', bug: 'var(--type-bug)',
  rock: 'var(--type-rock)', ghost: 'var(--type-ghost)', dragon: 'var(--type-dragon)',
  dark: 'var(--type-dark)', steel: 'var(--type-steel)', fairy: 'var(--type-fairy)',
};

const AIChat = ({ team }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Bzzzt! I am your Pokedex Assistant. What kind of team strategy are you looking for?', analysisData: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef(null);
  const loadingRef = useRef(null);

  // Auto scroll to the top of the last message, or to the loading indicator
  useEffect(() => {
    if (loading && loadingRef.current) {
      loadingRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else if (!loading && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages, loading]);

  const extractAnalysisData = (text) => {
    const regex = /```json\s*([\s\S]*?)\s*```/g;
    let cleanText = text;
    let analysisData = null;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        if (json.proposed_team) {
          analysisData = json;
        }
      } catch (e) {
        console.error("Failed to parse JSON analysis block", e);
      }
      cleanText = cleanText.replace(match[0], '');
    }
    return { cleanText, analysisData };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, analysisData: null }]);
    setLoading(true);

    try {
      const responseText = await startOrContinueChat(team, userMsg);
      const { cleanText, analysisData } = extractAnalysisData(responseText);
      
      let hydratedAnalysis = null;
      if (analysisData && analysisData.proposed_team) {
        // Fetch details for all proposed pokemon
        const detailsPromises = analysisData.proposed_team.map(async (pokemonData) => {
          const rawName = typeof pokemonData === 'string' ? pokemonData : pokemonData.name;
          
          // Ultra-resilient name parsing: remove anything in parentheses, trim, convert spaces to hyphens
          let nameSlug = rawName.split('(')[0].trim().toLowerCase();
          nameSlug = nameSlug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          
          const details = await fetchPokemonDetails(nameSlug);
          if (!details) {
            console.warn(`Failed to fetch details for ${rawName} (slug: ${nameSlug})`);
            return null;
          }
          // Merge PokeAPI details with the AI-provided competitive data
          return typeof pokemonData === 'object' ? { ...details, ...pokemonData } : details;
        });
        const details = await Promise.all(detailsPromises);
        hydratedAnalysis = {
          ...analysisData,
          proposed_team: details.filter(p => p !== null)
        };
      }

      setMessages(prev => [...prev, { role: 'model', content: cleanText, analysisData: hydratedAnalysis }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: `**Error:** ${error.message}`, analysisData: null }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetChat();
    setMessages([{ role: 'model', content: 'Chat history cleared. Bzzzt! Ready to build a new team!', analysisData: null }]);
  };

  const renderAnalysisBlocks = (data) => {
    if (!data) return null;

    return (
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Full Team Grid */}
        {data.proposed_team && data.proposed_team.length > 0 && (
          <div style={{ background: '#FFF', padding: '1rem', border: '3px solid var(--dex-dark-grey)', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#111', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <Sparkles size={16} color="var(--dex-dark-grey)" /> Proposed Roster
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
              {data.proposed_team.map((pokemon, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', background: 'var(--dex-grey)', border: '2px solid var(--dex-dark-grey)' }}>
                  <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <span style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.25rem', color: '#111' }}>{pokemon.name}</span>
                  <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {pokemon.types.map(type => (
                      <span key={type} style={{ 
                        backgroundColor: typeColors[type] || '#777', 
                        color: '#fff', 
                        fontSize: '0.55rem', 
                        padding: '0.25rem 0.25rem 0.05rem', 
                        borderRadius: '2px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        fontWeight: 'bold', 
                        border: '1px solid var(--dex-dark-grey)',
                        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1
                      }}>
                        {type}
                      </span>
                    ))}
                    {pokemon.tera_type && (
                      <span title="Tera Type" style={{ 
                        backgroundColor: '#fff', 
                        color: typeColors[pokemon.tera_type.toLowerCase()] || '#111', 
                        fontSize: '0.55rem', 
                        padding: '0.25rem 0.25rem 0.05rem', 
                        borderRadius: '2px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        fontWeight: 'bold', 
                        border: '1px solid var(--dex-dark-grey)', 
                        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '2px',
                        lineHeight: 1
                      }}>
                        💎 {pokemon.tera_type}
                      </span>
                    )}
                  </div>
                  {/* Competitive Data (if available) */}
                  {(pokemon.held_item || pokemon.nature || pokemon.moves) && (
                    <div style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.7rem', color: '#111', background: '#FFF', border: '1px solid var(--dex-border)', padding: '0.25rem' }}>
                      {pokemon.held_item && <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.1rem', marginBottom: '0.1rem' }}>Item: {pokemon.held_item}</div>}
                      {pokemon.nature && <div style={{ fontStyle: 'italic', color: '#444', marginBottom: '0.2rem' }}>Nature: {pokemon.nature}</div>}
                      {pokemon.moves && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.15rem' }}>
                          {pokemon.moves.map((move, idx) => (
                            <div key={idx} style={{ background: '#eee', padding: '0.2rem 0.1rem', textAlign: 'center', borderRadius: '2px', border: '1px solid #ccc', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', wordBreak: 'break-word' }}>{move}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {data.strengths && data.strengths.length > 0 && (
            <div style={{ background: '#e8f5e9', border: '3px solid #4caf50', padding: '1rem', boxShadow: '4px 4px 0 rgba(76, 175, 80, 0.2)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                <ShieldCheck size={16} /> Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#111' }}>
                {data.strengths.map((str, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{str}</li>)}
              </ul>
            </div>
          )}
          
          {data.weaknesses && data.weaknesses.length > 0 && (
            <div style={{ background: '#ffebee', border: '3px solid #f44336', padding: '1rem', boxShadow: '4px 4px 0 rgba(244, 67, 54, 0.2)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#c62828', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                <ShieldAlert size={16} /> Weaknesses
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#111' }}>
                {data.weaknesses.map((wk, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{wk}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Strategy */}
        {data.strategy && (
          <div style={{ background: '#e3f2fd', border: '3px solid #2196f3', padding: '1rem', boxShadow: '4px 4px 0 rgba(33, 150, 243, 0.2)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <Zap size={16} /> Strategy
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#111' }}>{data.strategy}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.5rem', borderBottom: '2px solid #3b4248', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0, color: '#FFF', textTransform: 'uppercase' }}>
          Rotom Dex
        </h2>
        <button onClick={handleReset} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'var(--dex-red)', border: '2px solid #FFF', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>
          Reset
        </button>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, index) => {
          // Scroll target: The user message right before the bot's latest reply (or the very first message if alone)
          const isScrollTarget = messages.length > 1 ? index === messages.length - 2 : index === 0;
          return (
          <div key={index} ref={isScrollTarget ? lastMessageRef : null} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              maxWidth: '90%', 
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--led-blue)' : '#FFF', color: '#fff',
                border: '2px solid var(--dex-border)', overflow: 'hidden'
              }}>
                {msg.role === 'user' ? <User size={14} /> : <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png" alt="Rotom" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
              </div>
              
              <div style={{ 
                background: msg.role === 'user' ? 'var(--dex-grey)' : '#F0F0F0',
                border: '2px solid var(--dex-border)',
                padding: '0.75rem',
                lineHeight: '1.4',
                fontSize: '0.9rem',
                color: '#111', /* FIX: Explicit dark text color */
                width: msg.role === 'model' ? '100%' : 'auto',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)'
              }}>
                {msg.content.trim() && (
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p style={{ margin: '0 0 0.5rem 0' }} {...props} />,
                        ul: ({node, ...props}) => <ul style={{ margin: '0 0 0.5rem 1.5rem', paddingLeft: '0.5rem' }} {...props} />,
                        ol: ({node, ...props}) => <ol style={{ margin: '0 0 0.5rem 1.5rem', paddingLeft: '0.5rem' }} {...props} />,
                        li: ({node, ...props}) => <li style={{ marginBottom: '0.2rem', paddingLeft: '0.2rem' }} {...props} />,
                        strong: ({node, ...props}) => <strong style={{ color: 'var(--dex-dark-red)' }} {...props} />
                      }}
                    >
                    {msg.content}
                  </ReactMarkdown>
                )}
                
                {renderAnalysisBlocks(msg.analysisData)}
              </div>
            </div>
          </div>
        )})}
        {loading && (
          <div ref={loadingRef} style={{ display: 'flex', gap: '0.5rem', maxWidth: '90%' }}>
            <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', color: '#fff', border: '2px solid var(--dex-border)', overflow: 'hidden' }}>
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png" alt="Rotom" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '0.75rem', background: '#FFF', border: '2px solid var(--dex-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
              <Loader2 className="animate-spin" size={16} color="var(--dex-border)" />
              <span style={{ color: '#111', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '0.75rem', borderTop: '2px solid #3b4248', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <textarea 
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
               e.preventDefault();
               handleSend();
               // Reset height after send
               e.target.style.height = 'auto';
            }
          }}
          placeholder="Consult Rotom..."
          disabled={loading}
          rows={1}
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', fontFamily: 'inherit', border: '2px solid var(--dex-border)', resize: 'none', overflowY: 'auto', minHeight: '40px', maxHeight: '120px' }}
        />
        <button 
          onClick={() => {
            handleSend();
            // Reset height if we can find the textarea
            const ta = document.querySelector('textarea');
            if (ta) ta.style.height = 'auto';
          }}
          disabled={loading || !input.trim()}
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--dex-border)', flexShrink: 0, background: 'var(--blue-key)', color: '#FFF' }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIChat;
