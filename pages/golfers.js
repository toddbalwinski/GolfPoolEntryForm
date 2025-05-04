// pages/golfers.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GolfersPage() {
  const [golfers, setGolfers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGolfers() {
      const { data, error } = await supabase
        .from('golfers')
        .select('*')
        .order('id', { ascending: true })
      if (error) {
        console.error(error)
        return
      }
      setGolfers(data)
      setLoading(false)
    }
    loadGolfers()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-center text-dark-green">
        Loading golfers…
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-2xl font-bold text-dark-green mb-4">
          All Golfers
        </h1>

        {/* make table horizontally scrollable on small screens */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  ID
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  Name
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {golfers.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    {g.id}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    {g.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    ${g.salary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
