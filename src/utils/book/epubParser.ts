import JSZip from 'jszip';
import { Manifest } from './type';
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
const getMetadataValue = (metadata: any, tagName: string): string | null => {
  try {
    // 尝试不同的命名空间
    const seletors = [`dc\\:${tagName}`, tagName, `*[*|${tagName}]`];

    for (const selector of seletors) {
      const element = metadata.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || '';
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * 提取文章的元数据
 */
const extractMetadata = (opf: Document) => {
  try {
    const metadata = opf.querySelector('metadata');
    return {
      title: getMetadataValue(metadata, 'title') || '未知标题',
      author: getMetadataValue(metadata, 'creator') || '未知作者',
      language: getMetadataValue(metadata, 'language') || '未知语言',
      publisher: getMetadataValue(metadata, 'publisher') || '未知出版社',
      description: getMetadataValue(metadata, 'description') || '未知描述',
    };
  } catch (error) {
    // 提取元数据失败
  }
};

/**
 * 提取manifest信息
 */
const extractManifest = (opf: Document, opfDir: string) => {
  const manifest: Manifest = {};
  try {
    const items = opf.querySelectorAll('manifest item'); // 这里也可以不写mainfest 因为虽然item 是manifest 的子元素 但是xml中通常没有其他的item标签
    items.forEach((item) => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');

      if (id && href) {
        manifest[id] = {
          href: opfDir + href,
          mediaType: mediaType || 'unknown',
        };
      }
    });
  } catch (error) {
    // 提取manifest失败
  }
  return manifest;
};

/**
 * 提取spine信息
 */
const extractSpine = (opf: Document) => {
  const spine: any = [];
  try {
    const items = opf.querySelectorAll('spine > itemref');

    items.forEach((item) => {
      const idref = item.getAttribute('idref');
      if (idref) {
        spine.push(idref);
      }
    });
  } catch (error) {
    // 提取spine失败
  }
  return spine;
};

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
    const src = contentElement?.getAttribute('src') || '';

    const item = {
      id: id || 'unknown',
      playOrder,
      label,
      src,
      children: [] as any[],
    };

    // 还要处理一下子导航点
    const childNavPoints = navPoint.querySelectorAll(':scope > navPoint');
    childNavPoints.forEach((childNavPoint) => {
      try {
        item.children.push(parseNavPoint(childNavPoint));
      } catch (error) {
        // 解析子目录项失败
      }
    });
    return item;
  } catch (error) {
    // 解析目录项失败
    return {
      id: 'unknown',
      playOrder: 0,
      label: '未知章节',
      src: '',
      children: [] as any[],
    };
  }
};

/**
 * 解析NCX目录
 */
const parseNcxToc = (ncx: Document) => {
  const toc: any[] = [];
  try {
    const navPoints = ncx.querySelectorAll('navMap > navPoint');
    navPoints.forEach((navPoint) => {
      try {
        toc.push(parseNavPoint(navPoint));
      } catch (error) {
        // 解析目录项失败
      }
    });
  } catch (error) {
    // 解析NCX目录失败
  }
  return toc;
};

/**
 * 解析NAV目录
 */
const parseNavToc = (navHtml: string) => {
  const toc: any[] = [];
  try {
    const parser = new DOMParser();
    const navDoc = parser.parseFromString(navHtml, 'text/html');
    const navElement =
      navDoc.querySelector('nav[epub\\:type="toc"]') || navDoc.querySelector('nav');

    if (navElement) {
      const links = navElement.querySelectorAll('a');
      links.forEach((link, index) => {
        try {
          toc.push({
            id: `nav-${index}`,
            playOrder: index + 1,
            label: link.textContent.trim() || `章节${index + 1}`,
            src: link.getAttribute('href') || '',
            children: [],
          });
        } catch (error) {
          // 解析目录项失败
        }
      });
    }
  } catch (error) {
    // 解析NAV目录失败
  }
  return toc;
};

/**
 *  提取目录信息
 */
const extractToc = async (zip, mainfest: Manifest) => {
  try {
    // 样本
    // <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>

    // 查找NCX文件 epub2.0
    const ncxItem = Object.values(mainfest).find(
      (item: any) => item.mediaType === 'application/x-dtbncx+xml',
    );

    if (ncxItem) {
      try {
        const ncxXml = await zip.file(ncxItem.href).async('text');
        const ncx = parseXml(ncxXml || '');
        return parseNcxToc(ncx);
      } catch (error) {
        // 解析NCX目录失败
      }
    }

    // 查找 NAV文件 epub3.0
    const navItem = Object.values(mainfest).find(
      (item: any) => item.mediaType === 'application/xhtml+xml' && item.href.includes('nav'),
    );

    if (navItem) {
      // TODO : 实现epub3.0的解析
      try {
        const navHtml = await zip.file(navItem.href).async('text');
        return parseNavToc(navHtml || '');
      } catch (error) {
        // 解析目录项失败
      }
    }

    return [];
  } catch (error) {
    // 提取目录失败
    return [];
  }
};

/**
 * 提取图片资源
 */

const extractImageResources = async (zip: JSZip, manifest: Manifest) => {
  const imageResources = new Map<string, string>();

  try {
    const imageItems = Object.values(manifest).filter(
      (item: any) => item.mediaType && item.mediaType.startsWith('image/'),
    );

    for (const imageItem of imageItems) {
      try {
        const imageFile = zip.file(imageItem.href);
        if (imageFile) {
          const imageData = await imageFile.async('base64');
          const mimeType = imageItem.mediaType;
          const dataUrl = `data:${mimeType};base64,${imageData}`;

          // 使用相对路径和绝对路径作为键
          imageResources.set(imageItem.href, dataUrl);

          // 也存储一下文件名作为键的
          const fileName = imageItem.href.split('/').pop() || '';
          imageResources.set(fileName, dataUrl);
        }
      } catch (error) {
        // 提取图片资源失败
      }
    }
  } catch (error) {
    // 提取图片资源失败
  }
  return imageResources;
};

/**
 * 从HTML中提取文本内容
 */
export const extractTextFromHtml = (htmlContent: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    // 移除script和style标签
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach((el) => el.remove());

    // 获取body内容，如果没有body则获取整个文档
    const body = doc.body || doc.documentElement;

    // 提取文本并清理格式
    let text = body.textContent || body.innerText || '';

    // 清理多余的空白字符
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  } catch (error) {
    // 提取文本内容失败
    // 简单的HTML标签移除
    return (
      htmlContent
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim() || '内容解析失败'
    );
  }
};

/**
 * 解析图片路径
 */
function resolveImagePath(imageSrc, chapterHref, imageResources) {
  try {
    // 如果已经是data URL，直接返回
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }

    // 获取章节所在目录
    const chapterDir = chapterHref.substring(0, chapterHref.lastIndexOf('/') + 1);

    // 尝试不同的路径解析方式
    const possiblePaths = [
      imageSrc, // 原始路径
      chapterDir + imageSrc, // 相对于章节目录
      imageSrc.replace('../', ''), // 移除相对路径标记
      imageSrc.split('/').pop(), // 只使用文件名
    ];

    for (const path of possiblePaths) {
      if (imageResources.has(path)) {
        return imageResources.get(path);
      }
    }

    // 图片路径解析失败
    return null;
  } catch (error) {
    // 解析图片路径失败
    return null;
  }
}

/**
 * 清理并格式化HTML内容，保留基本格式
 */
const cleanAndFormatHtml = async (html, chapterHref, imageResources) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const unWantedTages = ['script', 'style', 'meta', 'link', 'head'];
    unWantedTages.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    const body = doc.body || doc.documentElement;
    // 处理图片标签 - 转换为base64 data URL
    const images = body.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src) {
        const resolvedSrc = resolveImagePath(src, chapterHref, imageResources);
        // 如果解析成功，替换src属性
        if (resolvedSrc) {
          img.setAttribute('src', resolvedSrc);

          // 添加一些基本的样式
          img.setAttribute(
            'style',
            'max-width: 100%; height: auto; display: block; margin: 1em auto;',
          );

          if (!img.getAttribute('alt')) {
            img.setAttribute('alt', '图片');
          }
        } else {
          // 找不到图片，替换为占位符
          const alt = img.getAttribute('alt') || '图片';
          const placeholder = doc.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.innerHTML = `
            <div class="image-placeholder-content">
              <span class="image-icon">🖼️</span>
              <span class="image-text">图片加载失败: ${alt}</span>
            </div>
          `;
          if (img.parentNode) {
            img.parentNode.replaceChild(placeholder, img);
          }
        }
      }
    });

    // 清理内联样式，保留基本结构（但保留图片的样式）
    const allElements = body.querySelectorAll('*');
    allElements.forEach((el) => {
      // 对于图片，保留style属性
      if (el.tagName.toLowerCase() !== 'img') {
        el.removeAttribute('style');
      }
      el.removeAttribute('class');
      el.removeAttribute('id');

      // 保留语义化标签，移除其他属性
      const allowedTags = [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div',
        'span',
        'br',
        'ul',
        'ol',
        'li',
        'strong',
        'b',
        'em',
        'i',
        'blockquote',
        'img',
      ];
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        // 将不支持的标签转换为div或span
        const newTag = el.children.length > 0 ? 'div' : 'span';
        const newElement = doc.createElement(newTag);
        newElement.innerHTML = el.innerHTML;
        if (el.parentNode) {
          el.parentNode.replaceChild(newElement, el);
        }
      }
    });

    // 清理空白和格式
    let cleanHtml = body.innerHTML;

    // 规范化空白字符
    cleanHtml = cleanHtml.replace(/\s+/g, ' ');

    // 确保段落之间有适当的间距
    cleanHtml = cleanHtml.replace(/<\/p>\s*<p>/g, '</p>\n<p>');
    cleanHtml = cleanHtml.replace(/<\/h[1-6]>\s*<p>/g, '</h$1>\n<p>');
    cleanHtml = cleanHtml.replace(/<\/div>\s*<div>/g, '</div>\n<div>');

    return cleanHtml || '<p>内容为空</p>';
  } catch (error) {
    // HTML清理失败
    // 简单的清理
    let fallbackHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '');

    // 尝试处理图片
    if (imageResources && chapterHref) {
      fallbackHtml = fallbackHtml.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
        const resolvedPath = resolveImagePath(src, chapterHref, imageResources);
        return resolvedPath ? match.replace(src, resolvedPath) : '[图片加载失败]';
      });
    } else {
      fallbackHtml = fallbackHtml.replace(/<img[^>]*>/gi, '[图片]');
    }

    return fallbackHtml || '<p>内容解析失败</p>';
  }
};

/**
 * 在目录中查找对应的项目
 */
function findTocItem(toc, href) {
  try {
    const filename = href.split('/').pop();

    for (const item of toc) {
      // 更灵活的匹配逻辑
      if (item.src) {
        const tocFilename = item.src.split('/').pop();
        if (
          tocFilename === filename ||
          item.src.includes(filename) ||
          filename.includes(tocFilename)
        ) {
          return item;
        }
      }
      if (item.children && item.children.length > 0) {
        const found = findTocItem(item.children, href);
        if (found) return found;
      }
    }
  } catch (error) {
    // 查找目录项失败
  }

  return null;
}

/**
 * 按照spine的顺序组织章节
 */
const organizeChapters = async (zip: JSZip, spine: string[], manifest: Manifest, toc: any[]) => {
  const chapters: any[] = [];

  // 提取全部图片资源
  const imageResources = await extractImageResources(zip, manifest);

  for (let i = 0; i < spine.length; i++) {
    const itemId = spine[i];
    const item = manifest[itemId];

    //  提取章节内容
    if (item && item.mediaType === 'application/xhtml+xml') {
      try {
        const file = zip.file(item.href);
        // 读取文件内容
        const htmlContent = file ? await file.async('text') : '';
        // 提取文本内容
        const textContent = extractTextFromHtml(htmlContent || '');
        const formattedHtmlContent = await cleanAndFormatHtml(
          htmlContent,
          item.href,
          imageResources,
        );

        // 从目录中找到对应的标题
        const tocItem = findTocItem(toc, item.href);
        const title = tocItem?.label || tocItem?.title || '章节' + (i + 1);

        chapters.push({
          id: itemId,
          href: item.href,
          title: title,
          content: textContent, // 纯文本内容
          htmlContent: formattedHtmlContent, // 格式化的HTML内容  用于页面的显示
          rawHtmlContent: htmlContent, // 原始的HTML内容 备用
          order: i,
        });
      } catch (error) {
        // 章节解析失败
      }
    }
  }

  return chapters;
};

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
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
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
    const manifest: Manifest = extractManifest(opf, opfDir || '');
    // 书脊 (阅读顺序)
    const spine = extractSpine(opf);

    // 读取目录文件(兼容epub2.0和epub3.0)
    const toc = await extractToc(zip, manifest);

    // 按照spine的顺序进行章节组织
    const chapters: any[] = await organizeChapters(zip, spine, manifest, toc);

    return {
      title: metadata?.title || '未知标题',
      author: metadata?.author || '未知作者',
      chapters: chapters,
      language: metadata?.language || '未知语言',
      publisher: metadata?.publisher || '未知出版社',
      description: metadata?.description || '无描述',
      toc: toc,
    };
  } catch (error) {
    throw new Error('EPUB解析失败:' + error.message);
  }
};
