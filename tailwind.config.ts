import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    container: {
      screens: {
        DEFAULT: '100%',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1024px',
        '2xl': '1024px'
      }
    }
  }
}
