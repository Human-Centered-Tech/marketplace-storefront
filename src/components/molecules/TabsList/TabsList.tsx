import { TabsTrigger } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const TabsList = ({
  list,
  activeTab,
}: {
  list: { label: string; link: string }[]
  activeTab: string
}) => {
  return (
    <div className="flex gap-4 w-full">
      {list.map(({ label, link }) => (
        // scroll={false}: these "tabs" are route navigations (each tab is its
        // own page under /sellers/[handle]). Next's default scroll reset threw
        // the user back to the top of the 640px seller hero on every tab tap —
        // they were looking at the tab bar when they clicked, so keeping the
        // scroll position IS the fix (Matteo/Brooke web polish: "toggle
        // behavior").
        <LocalizedClientLink key={label} href={link} scroll={false}>
          <TabsTrigger isActive={activeTab === label.toLowerCase()}>
            {label}
          </TabsTrigger>
        </LocalizedClientLink>
      ))}
    </div>
  )
}
