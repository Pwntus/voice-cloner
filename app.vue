<template lang="pug">
#app.h-full
  main.container.mx-auto.p-2(
    class="lg:p-4"
  )
    .text-3xl.font-medium.mt-2.text-center(
      class="lg:text-5xl lg:mt-4"
    )
      | Voice Cloner
      a.ml-6(
        href="https://github.com/Pwntus/voice-cloner"
        target="_new"
        style="display: inline-block;"
      )
        svg.w-8.h-8(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        )
          path(
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            stroke-linecap="round"
            stroke-linejoin="round"
          )
      a.ml-6(
        href="https://replicate.com/lucataco/xtts-v2"
        target="_new"
        style="display: inline-block;"
      )
        svg.w-8.h-8(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
        )
          polygon(points="1000,427.6 1000,540.6 603.4,540.6 603.4,1000 477,1000 477,427.6")
          polygon(points="1000,213.8 1000,327 364.8,327 364.8,1000 238.4,1000 238.4,213.8")
          polygon(points="1000,0 1000,113.2 126.4,113.2 126.4,1000 0,1000 0,0")
    .text-base.font-normal.mt-2.text-center(
      class="lg:text-xl lg:mt-4"
    ) Record a sample of your own voice and let AI narrate the text in your own voice.

    microphone.mt-2(
      @data="onData"
      class="lg:mt-4"
    )

    template(v-if="speaker")
      textarea.mt-6(
        v-model="text"
        class="lg:mt-12"
      )
      button.mt-2(
        @click="submit"
        :disabled="loading"
        class="lg:mt-4"
      ) {{ loading ? 'Loading...' : 'Speak' }}
      select.ml-6(
        v-model="language"
      )
        option(
          v-for="(item, index) in languages"
          :key="`language-${index}`"
          :value="item.value"
        ) {{ item.text }}

    .output(
      v-for="(item, index) in predictions"
      :key="`prediction-${index}`"
    )
      b Status: {{ item.status }}
      audio.mt-2(
        v-if="item.output && item.output !== ''"
        class="lg:mt-4"
        controls
      )
        source(
          :src="item.output"
          type="audio/wav"
        )
</template>

<script>
import rwp from 'replicate-webhook-proxy'

const makeid = (length) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

const ws_id = makeid(10)
const client = rwp(ws_id)

export default {
  name: 'App',
  data: () => ({
    speaker: null,
    text: `This is not my real voice, but perhaps it's pretty close to the real one?`,
    language: 'en',

    loading: false,
    languages: [
      { text: 'English', value: 'en' },
      { text: 'Spanish', value: 'es' },
      { text: 'French', value: 'fr' },
      { text: 'German', value: 'de' },
      { text: 'Italian', value: 'it' },
      { text: 'Russian', value: 'ru' },
      { text: 'Dutch', value: 'nl' },
      { text: 'Arabic', value: 'ar' },
      { text: 'Chinese (simplified)', value: 'zh' },
      { text: 'Korean', value: 'ko' }
    ],
    predictions: []
  }),
  methods: {
    onData(data) {
      this.speaker = data
    },
    async submit() {
      try {
        if (!this.speaker || this.text == '') return

        this.loading = true
        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            speaker: this.speaker,
            text: this.text,
            language: this.language,
            ws_id
          })
        })
        const prediction = await response.json()
        this.predictions.unshift(prediction)
        this.loading = false
      } catch (e) {
        console.log('--- log: failed to call API:', e)
        this.loading = false
      }
    }
  },
  mounted() {
    client.on('message', async (event) => {
      try {
        const { type } = event.data.query

        // We got the final audio, play it
        if (type === 'audio') {
          const prediction = event.data.body
          console.log(`--- log: got audio response`)

          const audio = new Audio(prediction.output)
          audio.play()

          // Replace in predictions list
          const index = this.predictions.findIndex(
            (p) => p.id === prediction.id
          )
          if (index >= 0) this.predictions[index] = prediction
        }
      } catch (e) {
        console.log('--- log: failed to parse webhook:', e)
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
#app
  textarea
    width 100%
    padding 15px
    border 1px solid #000
    display block

  button
    padding 10px 20px
    border 1px solid #000
    background #000
    color #fff
    font-size 20px
    font-weight 200

    &:hover
      background #666

  .output
    margin-top 15px
    padding 1rem
    background #e2e250

    audio
      width 100%
</style>
