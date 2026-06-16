import PatientCapsule from '@/app/components/PatientCapsule'

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100dvh',
      background: '#000005',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <PatientCapsule />
    </main>
  )
}