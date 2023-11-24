import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

export default defineEventHandler(async (event) => {
  try {
    const { speaker, text, language, ws_id } = await readBody(event)
    console.log(`--- log: text = ${text}`)

    let prediction
    const input = {
      speaker,
      text,
      language,
      cleanup_voice: true
    }

    if (process.env.REPLICATE_USE_DEPLOYMENT) {
      console.log(
        '--- log: creating xtts-v2 prediction to get the voice synthesis, using Replicate deployment'
      )
      prediction = await replicate.deployments.predictions.create(
        'replicate',
        'replicate-narrator',
        {
          input,
          webhook: `https://r3swiuknhh.execute-api.eu-west-1.amazonaws.com/prod/webhook?key=${ws_id}&type=audio`,
          webhook_events_filter: ['completed']
        }
      )
    } else {
      console.log(
        '--- log: creating xtts-v2 prediction to get the voice synthesis'
      )
      prediction = await replicate.predictions.create({
        // lucataco/xtts-v2
        version:
          '6b2385a9c081443f17041bf1a4caeb36393903f4d7e94468f32e90b2ec57ffc2',
        input,
        webhook: `https://r3swiuknhh.execute-api.eu-west-1.amazonaws.com/prod/webhook?key=${ws_id}&type=audio`,
        webhook_events_filter: ['completed']
      })
    }
    console.log('--- info: creating prediction... DONE!')

    return prediction
  } catch (e) {
    console.log('--- error: ', e)

    throw createError({
      statusCode: 500,
      statusMessage: 'Something went wrong with the API request.'
    })
  }
})
