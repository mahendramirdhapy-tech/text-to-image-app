export const metadata = {
  title: 'Text to Image Generator',
  description: 'Generate images from text using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
