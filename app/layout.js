import './globals.css'

export const metadata = {
  title: 'User Details Form',
  description: 'Form to collect user details and generate ID card',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
