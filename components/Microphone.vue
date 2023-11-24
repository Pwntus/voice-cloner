<template lang="pug">
#microphone
  button(
    v-if="!isRecording"
    @click="doRecord"
  ) {{ blobs.length > 0 ? 'Record new sample' : 'Record' }}
  #modal(v-else)
    #card
      .text-base.font-normal(
        class="lg:text-xl"
      ) Read out loud the following in a clear voice:
      .text-3xl.font-medium.mt-2(
        class="lg:text-5xl lg:mt-4"
      ) {{ getSentence() }}
      svg.w-12.h-12(
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        style="margin: 50px auto 0"
      )
        path(
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          stroke-linecap="round"
          stroke-linejoin="round"
        )
      p Recording...

  audio.mt-2(
    v-if="blobs.length > 0"
    ref="audio"
    class="lg:mt-4"
    controls
  )
</template>

<script>
import { MediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'

const RECORDING_TIMEOUT = 10000

export default {
  name: 'Microphone',
  data: () => ({
    stream: null,
    recorder: null,
    blobs: [],

    isRecording: false,

    sentences: [
      'The quick brown fox jumps over the lazy dog.',
      'Pack my box with five dozen liquor jugs.',
      'How razorback-jumping frogs can level six piqued gymnasts!',
      'Mr Jock, TV quiz PhD, bags few lynx.',
      'The five boxing wizards jump quickly.'
    ]
  }),
  methods: {
    getSentence() {
      return this.sentences[Math.floor(Math.random() * this.sentences.length)]
    },
    async record() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        })

        this.recorder = new MediaRecorder(this.stream, {
          mimeType: 'audio/wav'
        })
        this.recorder.addEventListener('dataavailable', (e) => {
          this.blobs.push(e.data)
        })
        this.recorder.start()
        this.isRecording = true
      } catch (e) {
        console.log(e)
        this.isRecording = false
      }
    },
    async stop() {
      try {
        const mimeType = this.recorder.mimeType

        this.recorder.addEventListener('stop', () => {
          const blob = new Blob(this.blobs, { type: mimeType })

          // Read as base64 encoded data URI
          const reader = new FileReader()
          reader.onload = () => {
            this.$emit('data', reader.result)

            this.$refs.audio.innerHTML = `<source src="${URL.createObjectURL(
              blob
            )}" type="${mimeType}" />`
          }
          reader.readAsDataURL(blob)
        })

        this.recorder.stop()
        this.stream.getTracks().forEach((track) => track.stop())

        this.stream = null
        this.recorder = null
        this.isRecording = false
      } catch (e) {
        console.log(e)
        this.isRecording = false
      }
    },
    doRecord() {
      this.record()
      setTimeout(() => {
        this.stop()
      }, RECORDING_TIMEOUT)
    }
  },
  async mounted() {
    await register(await connect())
  }
}
</script>

<style lang="stylus" scoped>
#microphone
  text-align center

  button
    padding 10px 20px
    border 1px solid #000
    background #000
    color #fff
    font-size 20px
    font-weight 200

    &:hover
      background #666

  #modal
    z-index 100
    padding 3rem
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, .5)

    #card
      padding 2rem
      background #fff

  audio
    width 100%
</style>
