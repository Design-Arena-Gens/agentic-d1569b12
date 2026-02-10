'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>([])

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  ).sort()

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTag = !selectedTag || note.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  }).sort((a, b) => b.updatedAt - a.updatedAt)

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setTitle(newNote.title)
    setContent(newNote.content)
    setCurrentTags(newNote.tags)
    setIsEditing(true)
  }

  const saveNote = () => {
    if (!selectedNote) return

    const updatedNote = {
      ...selectedNote,
      title: title.trim() || 'Untitled',
      content,
      tags: currentTags,
      updatedAt: Date.now()
    }

    setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n))
    setSelectedNote(updatedNote)
    setIsEditing(false)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  const selectNote = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCurrentTags(note.tags)
    setIsEditing(false)
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !currentTags.includes(tag)) {
      setCurrentTags([...currentTags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setCurrentTags(currentTags.filter(t => t !== tag))
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Notes</h1>
          <button className={styles.newBtn} onClick={createNote}>
            <span className={styles.plusIcon}>+</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {allTags.length > 0 && (
          <div className={styles.tagFilter}>
            <button
              className={`${styles.filterTag} ${!selectedTag ? styles.activeTag : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`${styles.filterTag} ${selectedTag === tag ? styles.activeTag : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className={styles.notesList}>
          {filteredNotes.length === 0 ? (
            <div className={styles.emptyState}>
              {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`${styles.noteItem} ${selectedNote?.id === note.id ? styles.activeNote : ''}`}
                onClick={() => selectNote(note)}
              >
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                  >
                    ×
                  </button>
                </div>
                <p className={styles.notePreview}>
                  {note.content.substring(0, 100)}
                </p>
                {note.tags.length > 0 && (
                  <div className={styles.noteTags}>
                    {note.tags.map(tag => (
                      <span key={tag} className={styles.noteTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        {selectedNote ? (
          <>
            {isEditing ? (
              <div className={styles.editor}>
                <div className={styles.editorHeader}>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.titleInput}
                    placeholder="Note title"
                  />
                  <button className={styles.saveBtn} onClick={saveNote}>
                    Save
                  </button>
                </div>

                <div className={styles.tagSection}>
                  <div className={styles.tagInputGroup}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addTag)}
                      className={styles.tagInputField}
                      placeholder="Add tag..."
                    />
                    <button className={styles.addTagBtn} onClick={addTag}>
                      Add
                    </button>
                  </div>
                  <div className={styles.currentTags}>
                    {currentTags.map(tag => (
                      <span key={tag} className={styles.editTag}>
                        {tag}
                        <button
                          className={styles.removeTagBtn}
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.contentInput}
                  placeholder="Start typing your note..."
                />
              </div>
            ) : (
              <div className={styles.viewer}>
                <div className={styles.viewerHeader}>
                  <h2 className={styles.viewerTitle}>{selectedNote.title}</h2>
                  <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                </div>

                {selectedNote.tags.length > 0 && (
                  <div className={styles.viewerTags}>
                    {selectedNote.tags.map(tag => (
                      <span key={tag} className={styles.viewerTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.viewerContent}>
                  {selectedNote.content || <em className={styles.emptyContent}>No content</em>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.welcome}>
            <h2>Welcome to Notes</h2>
            <p>Select a note or create a new one to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
