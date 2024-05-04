import axios from 'axios'
import { writeFileSync } from 'fs'
import sharp from 'sharp'
import { traits } from './data'

const ORD_URL = 'https://ord-mirror.magiceden.dev/content'
const PATH = './src/traits'

const crawlTrait = async (id: string) => {
  const url = `${ORD_URL}/${id}`

  const response = await axios.get(url, { responseType: 'arraybuffer' })

  const webPBuffer = await sharp(response.data).webp().toBuffer()

  const path = `${PATH}/${id}.webp`

  writeFileSync(path, webPBuffer)
}

const main = async () => {
  const ps: Promise<void>[] = []

  console.log('Crawling traits...')

  for (const [_, obj] of Object.entries(traits)) {
    for (const [_, id] of Object.entries(obj)) {
      ps.push(crawlTrait(id))
    }
  }

  await Promise.all(ps)
  console.log(`Crawled ${ps.length} traits!`)
}

main()
