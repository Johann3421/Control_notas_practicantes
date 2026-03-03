"use client"

import { useState } from "react"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  children: (activeTab: string) => React.ReactNode
  className?: string
}

export default function Tabs({ tabs, defaultTab, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={className}>
      <div className="flex border-b border-base-600 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? "border-electric-500 text-electric-400"
                : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-base-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(activeTab)}</div>
    </div>
  )
}
