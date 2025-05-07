function removeCategorySection(data) {
    // 深拷贝原始数据以避免修改原对象
    const cleanedData = JSON.parse(JSON.stringify(data));
    
    cleanedData.data = cleanedData.data.map(section => {
        // 仅处理 DISCOVERY_HEADER 类型的模块
        if (section.type === "DISCOVERY_HEADER") {
            // 过滤掉 text 为 "分类" 的条目
            section.data = section.data.filter(item => 
                !(item.rightContent?.type === "TEXT" && 
                item.rightContent?.text === "分类")
        }
        return section;
    });

    return cleanedData;
}

// 使用示例
const cleanedResponse = removeCategorySection(responseBody);