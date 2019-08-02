import cheerio from 'cheerio-without-node-native'
import urlObj from 'url'

import { REGEX_VALID_URL } from './parserConfig'

export const getPreview = (url, options) => new Promise((resolve, reject) => {
  if (!url) {
    return reject('Didn\'t receive a url')
  }

  if (url) {
    fetch(url)
      .then((response) => {
        if (response.status === 200) {
          return response.text()
        }
        return reject('Something went wrong')
      })
      .then((text) => {
        resolve(parseResponse(text, url, options || {}))
      })
      .catch(error => reject(error))
  } else {
    reject({
      error: 'Didn\'t receive a url',
    })
  }
})

const parseResponse = (body, url, options) => {
  const doc = cheerio.load(body)

  return {
    url,
    title: getTitle(doc),
    description: getDescription(doc),
    mediaType: getMediaType(doc) || 'website',
    images: getImages(doc, url, options.imagesPropertyType),
    videos: getVideos(doc),
  }
}

const getTitle = (doc) => {
  let title = doc('meta[property=\'og:title\']').attr('content')

  if (!title) {
    title = doc('title').text()
  }

  return title
}

const getDescription = (doc) => {
  let description = doc('meta[name=description]').attr('content')

  if (description === undefined) {
    description = doc('meta[name=Description]').attr('content')
  }

  if (description === undefined) {
    description = doc('meta[property=\'og:description\']').attr('content')
  }

  return description
}

const getMediaType = (doc) => {
  const node = doc('meta[name=medium]')

  if (node.length) {
    const content = node.attr('content')
    return content === 'image' ? 'photo' : content
  }
  return doc('meta[property=\'og:type\']').attr('content')
}

const getImages = (doc, rootUrl, imagesPropertyType) => {
  let images = [],
    nodes,
    src,
    dic

  nodes = doc(`meta[property='${imagesPropertyType || 'og'}:image']`)

  if (nodes.length) {
    nodes.each((index, node) => {
      src = node.attribs.content
      if (src) {
        src = urlObj.resolve(rootUrl, src)
        images.push(src)
      }
    })
  }

  if (images.length <= 0 && !imagesPropertyType) {
    src = doc('link[rel=image_src]').attr('href')
    if (src) {
      src = urlObj.resolve(rootUrl, src)
      images = [src]
    } else {
      nodes = doc('img')

      if (nodes.length) {
        dic = {}
        images = []
        nodes.each((index, node) => {
          src = node.attribs.src
          if (src && !dic[src]) {
            dic[src] = 1
            // width = node.attribs.width
            // height = node.attribs.height
            images.push(urlObj.resolve(rootUrl, src))
          }
        })
      }
    }
  }

  return images
}

const getVideos = (doc) => {
  const videos = []
  let nodeTypes
  let nodeSecureUrls
  let nodeType
  let nodeSecureUrl
  let video
  let videoType
  let videoSecureUrl
  let width
  let height
  let videoObj
  let index

  const nodes = doc('meta[property=\'og:video\']')
  const length = nodes.length

  if (length) {
    nodeTypes = doc('meta[property=\'og:video:type\']')
    nodeSecureUrls = doc('meta[property=\'og:video:secure_url\']')
    width = doc('meta[property=\'og:video:width\']').attr('content')
    height = doc('meta[property=\'og:video:height\']').attr('content')

    for (index = 0; index < length; index++) {
      video = nodes[index].attribs.content

      nodeType = nodeTypes[index]
      videoType = nodeType ? nodeType.attribs.content : null

      nodeSecureUrl = nodeSecureUrls[index]
      videoSecureUrl = nodeSecureUrl ? nodeSecureUrl.attribs.content : null

      videoObj = {
        url: video,
        secureUrl: videoSecureUrl,
        type: videoType,
        width,
        height,
      }
      if (videoType.indexOf('video/') === 0) {
        videos.splice(0, 0, videoObj)
      } else {
        videos.push(videoObj)
      }
    }
  }

  return videos
}
