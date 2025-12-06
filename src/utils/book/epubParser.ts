import JSZip from 'jszip';
import { Manifest } from './type';
import { any } from 'vue-types';
/**
 * 解析XML字符串 - 使用浏览器原生DOMParser
 */
export const parseXml = (xmlString: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  return xmlDoc;
};


/**
 * 自封装方法获取元数据值
 */
const getMetadataValue = (metadata: any, tagName: string):string|null => { 
  try { 
    // 尝试不同的命名空间
    let seletors = [
      `dc\\:${tagName}`,
      tagName,
      `*[*|${tagName}]`
    ]

    for (let selector of seletors) {
      const element = metadata.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || '';
      }
    }
    return null
  }
  catch(error){
    console.warn(`获取元数据 ${tagName} 失败:`, error)
    return null;
  }
}


/**
 * 提取文章的元数据
 */
const extractMetadata = (opf: Document) => { 
  try{
    const metadata = opf.querySelector('metadata');
    return {
      title: getMetadataValue(metadata, 'title') || '未知标题',
      author: getMetadataValue(metadata, 'creator') || '未知作者',
      language: getMetadataValue(metadata, 'language') || '未知语言',
      publisher: getMetadataValue(metadata, 'publisher') || '未知出版社',
      description: getMetadataValue(metadata, 'description') || '未知描述',
    }
  }catch(error){
    console.error('提取元数据失败', error);
  }
} 


/**
 * 提取manifest信息
 */
const extractManifest = (opf: Document, opfDir: string) => { 
  const manifest:Manifest = {}
  try { 
    const items = opf.querySelectorAll('manifest item'); // 这里也可以不写mainfest 因为虽然item 是manifest 的子元素 但是xml中通常没有其他的item标签
    items.forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');
     
      if (id && href) { 
        manifest[id] = {
          href: opfDir + href,
          mediaType: mediaType || 'unknown'
        }
      }
    })
  }catch(error){
    console.error('提取manifest失败', error);
  }
  return manifest
}


/**
 * 提取spine信息
 */
const extractSpine = (opf: Document) => {
  const spine:any = []
  try { 
    const items = opf.querySelectorAll('spine > itemref')
    
    items.forEach(item => {
      const idref = item.getAttribute('idref');
      if (idref) {
        spine.push(idref);
      }
    })
  }catch(error){
    console.error('提取spine失败', error);
  }
  return spine
}



/**
* 解析NCX目录项
*/
const parseNavPoint = (navPoint: Element) => { 
  try { 
    const id = navPoint.getAttribute('id');
    const playOrder = parseInt(navPoint.getAttribute('playorder') || '0');

    const labelElement = navPoint.querySelector('navLabel > text');
    const label = labelElement ? labelElement.textContent.trim() : '未知章节';
    
    const contentElement = navPoint.querySelector('content');
    const src=contentElement?.getAttribute('src') || '';
    
    const item = {
      id: id || 'unknown',
      playOrder,
      label,
      src,
      children: [] as any[]
    }

    // 还要处理一下子导航点
    const childNavPoints = navPoint.querySelectorAll(':scope > navPoint');
    childNavPoints.forEach(childNavPoint => {
      try {
        item.children.push(parseNavPoint(childNavPoint))
      }
      catch (error) {
        console.error('解析子目录项失败', error);
      }
    })
    return item
  }catch(error){
    console.error('解析目录项失败', error);
    return {
      id: 'unknown',
      playOrder:0,
      label:'未知章节',
      src:'',
      children: [] as any[]
    }
  }
}

/**
 * 解析NCX目录
 */
const parseNcxToc = (ncx: Document) => {
  const toc:any[] = [] 
  try {
    const navPoints = ncx.querySelectorAll('navMap > navPoint')
    navPoints.forEach(navPoint => {
      try {
        toc.push(parseNavPoint(navPoint))
      }
      catch (error) {
        console.error('解析目录项失败', error);
      }
    })
  }catch(error){
    console.error('解析NCX目录失败', error);
  }
  return toc
}


/**
 * 解析NAv目录
 */

/**
 *  提取目录信息
 */
const extractToc = async (zip, mainfest:Manifest, opfDir) => { 
  try { 
    // 样本
    // <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
    
    // 查找NCX文件 epub2.0
    const ncxItem = Object.values(mainfest).find((item: any) => item.mediaType === 'application/x-dtbncx+xml');

    if (ncxItem) { 
      try { 
        const ncxXml=await zip.file(ncxItem.href).async('text');
        const ncx = parseXml(ncxXml || '');
        return parseNcxToc(ncx);
      }catch(error){
        console.error('解析NCX目录失败', error);
      }
    }

    // 查找 NAV文件 epub3.0
    const navItem = Object.values(mainfest).find((item: any) => item.mediaType === 'application/xhtml+xml' && item.href.includes('nav')

    if(navItem) {
      // TODO : 实现epub3.0的解析
     }
  }

}



/*
样本：
 <?xml version="1.0"?>
 <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
       <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
      
    </rootfiles>
 </container>
   */ 

/**
 * 解析EPUB文件
 * @param {File} file - EPUB文件
 * @returns {Promise<Object>} 解析后的书籍数据
 */
export const parseEpub = async (file: File) => {
  try { 
    const zip = await JSZip.loadAsync(file);
    
    // 读取解析后的META-INF/container.xml文件 获取OPF文件路径
    const containerXml=await zip.file('META-INF/container.xml')?.async('text');
    const container = parseXml(containerXml || '');
    
    // 获取opf文件路径
    const rootfile = container.querySelector('rootfile');
    const opfPath = rootfile?.getAttribute('full-path');
    const opfDir = opfPath?.substring(0, opfPath.lastIndexOf('/') + 1);

    // 读取opf文件
    const opfXml = await zip.file(opfPath || '')?.async('text');
    const opf = parseXml(opfXml || '');

    // 提取元数据
    const metadata = extractMetadata(opf);

    // 清单
    const manifest:Manifest = extractManifest(opf, opfDir || '');
    // 书脊 (阅读顺序)
    const spine=extractSpine(opf);

    // 读取目录文件

  }
};
