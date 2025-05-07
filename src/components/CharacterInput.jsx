import React from "react"

export function CharacterInput({ char, setChar }) {
  // Only update when input loses focus or user presses Enter
  const handleInput = (e) => {
    setChar(e.target.value.slice(0, 1))
  }

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      background: 'rgba(30,32,40,0.85)',
      padding: '10px 16px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <label style={{ color: '#fff', marginRight: 8 }}>
        Character:
        <input
          type="text"
          defaultValue={char}
          maxLength={1}
          onBlur={handleInput}
          onKeyDown={e => {
            if (e.key === "Enter") handleInput(e)
          }}
          style={{
            marginLeft: 8,
            width: 32,
            fontSize: 24,
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid #444',
            background: '#222',
            color: '#fff'
          }}
        />
      </label>
    </div>
  )
}
