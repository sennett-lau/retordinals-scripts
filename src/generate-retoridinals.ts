import fs from 'fs'
import sharp, { OverlayOptions } from 'sharp'
import { layering, traits, variations } from './data'

const traitsBufferMap = new Map<string, Buffer>()

const loadTraits = () => {
  console.log('Loading traits...')

  const traitsPath = './src/traits'
  const fileType = 'webp'

  const traitFiles = fs.readdirSync(traitsPath)

  for (const file of traitFiles) {
    const id = file.replace(`.${fileType}`, '')
    const buffer = fs.readFileSync(`${traitsPath}/${file}`)

    traitsBufferMap.set(id, buffer)
  }

  console.log(`Loaded ${traitFiles.length} traits!`)
}

const generateRetoridinals = async (ids: string[], filename: string) => {
  try {
    const retoridinalsPath = './src/retoridinals'
    const fileType = 'webp'

    if (!fs.existsSync(retoridinalsPath)) {
      fs.mkdirSync(retoridinalsPath)
    }

    const buffers = ids.map((id) => traitsBufferMap.get(id))

    let overlay = sharp(buffers[0], { pages: -1 })

    const composites = buffers.slice(1).map((buffer) => ({ input: buffer, gravity: 'center', blend: 'over' }))

    overlay = overlay.composite(composites as OverlayOptions[])

    await overlay.webp().toFile(`${retoridinalsPath}/${filename}.${fileType}`)
  } catch (e) {
    console.log(ids, filename)
    console.error(e)
  }
}

const main = async () => {
  loadTraits()

  console.log('Generating retoridinals...')

  const ps: Promise<void>[] = []

  let i = 1

  for (const vari of variations) {
    const ids: string[] = []

    for (const layer of layering) {
      if (layer === 'background' || layer === 'background art') {
        continue
      }

      // @ts-ignore
      const tName = vari[layer]

      if (tName === 'none' || tName === undefined) {
        continue
      }

      // @ts-ignore
      if (traits[layer] === undefined) {
        continue
      }

      // @ts-ignore
      const id = traits[layer][tName]

      if (id === undefined) {
        continue
      }

      ids.push(id)
    }

    ps.push(generateRetoridinals(ids, `${i++}`))
  }

  await Promise.all(ps)

  console.log(`Generated ${ps.length} retoridinals!`)
}

main()
