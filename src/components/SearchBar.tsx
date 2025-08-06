import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MagnifyingGlass, X } from '@phosphor-icons/react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search posts...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    // Provide real-time search as user types
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlass 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </form>
  )
}