// ==================== 角色卡池数据 ====================
const star1Chars = [
    "斯巴达克斯", "阿斯忒里俄斯", "佐佐木小次郎", "莫扎特", "玛塔 哈利",
    "保罗 班扬", "阿拉什", "伊阿宋", "巴沙洛缪 罗伯茨", "夏绿蒂 科黛"
];

const star2Chars = [
    "莎士比亚", "列奥尼达斯一世", "咒腕哈桑"
];

const star3Chars = [
    "盖乌斯 尤里乌斯 凯撒", "吉尔 德 雷", "弗格斯 马克 罗伊", "罗宾汉",
    "库 丘林", "库 丘林【Prototype】", "罗缪路斯", "美杜莎", "牛若丸",
    "亚历山大", "美狄亚", "荆轲", "吕布奉先", "大流士三世", "大卫",
    "赫克托耳", "迪尔姆德 奥迪那", "冯 霍恩海姆 帕拉塞尔苏斯"
];

const star4Chars = [
    "巴御前", "望月千代女", "柳生但马守宗矩", "加藤段藏", "伊利酱II号机",
    "喀耳刻", "哪吒", "示巴女王", "浅上藤乃", "阿塔兰忒【Alter】",
    "喀戎", "齐格", "瓦尔基里", "贞德【AlterBerserker】", "牛若丸【Assassin】",
    "茨生童子【Lancer】", "迷之女主角XX", "迪尔姆德 奥迪纳【Saber】",
    "酒吞童子【Caster】", "兰陵王"
];

const star5Chars = [
    "阿尔托莉雅 潘德拉贡", "阿提拉", "吉尔伽美什", "诸葛孔明 【艾尔梅洛伊二世】",
    "费拉德三十", "贞德(1)", "俄里翁", "玉藻前", "冲田总司", "斯卡哈",
    "开膛手杰克", "莫德雷德", "阿周那", "迦尔纳", "迷之女主角X", "布伦希尔德"
];

// 概率设定（分母100000，十万分之一精度）
// 五星: 5/100000 = 0.005%
// 四星: 8/100000 = 0.008%
// 三星: 14987/100000 = 14.987%
// 二星: 35000/100000 = 35%
// 一星: 50000/100000 = 50%
const PROB = {
    STAR5_START: 0,
    STAR5_END: 5,           // 0-4  → 五星 (5种)
    STAR4_END: 13,          // 5-12 → 四星 (8种)
    STAR3_END: 15000,       // 13-14999 → 三星 (14987种)
    STAR2_END: 50000,       // 15000-49999 → 二星 (35000种)
    // 50000-99999 → 一星 (50000种)
};

// 保底计数器
let pityCount5 = 0;    // 距离上次五星的抽数
let pityCount4 = 0;    // 距离上次四星及以上的抽数

let totalPulls = 0;
let star5Count = 0;
let star4Count = 0;
let history = [];

// 获取随机角色名
function getRandomChar(star) {
    let arr;
    if (star === 5) arr = star5Chars;
    else if (star === 4) arr = star4Chars;
    else if (star === 3) arr = star3Chars;
    else if (star === 2) arr = star2Chars;
    else arr = star1Chars;
    return arr[Math.floor(Math.random() * arr.length)];
}

// 核心抽卡函数 - 每次独立随机
function pullOneCard() {
    let starNum = null;
    let isPity5 = false;
    let isPity4 = false;
    
    // 检查保底
    if (pityCount5 + 1 >= 330) {
        isPity5 = true;
    }
    if (pityCount4 + 1 >= 10) {
        isPity4 = true;
    }
    
    if (isPity5) {
        // 330保底：强制出五星
        starNum = 5;
    } else if (isPity4) {
        // 10抽保底：强制出四星或五星
        // 随机决定是四星还是五星（按原概率比例）
        let rand = Math.random() * 100000;
        if (rand < PROB.STAR5_END) {
            starNum = 5;
        } else {
            starNum = 4;
        }
    } else {
        // 正常抽卡：随机生成数字
        let rand = Math.random() * 100000;
        
        if (rand < PROB.STAR5_END) {
            starNum = 5;
        } else if (rand < PROB.STAR4_END) {
            starNum = 4;
        } else if (rand < PROB.STAR3_END) {
            starNum = 3;
        } else if (rand < PROB.STAR2_END) {
            starNum = 2;
        } else {
            starNum = 1;
        }
    }
    
    // 获取角色名
    let charName = getRandomChar(starNum);
    
    // 更新计数器
    if (starNum === 5) {
        star5Count++;
        pityCount5 = 0;
        pityCount4 = 0;
    } else {
        pityCount5++;
        if (starNum === 4) {
            star4Count++;
            pityCount4 = 0;
        } else {
            pityCount4++;
        }
    }
    totalPulls++;
    
    let starName = starNum === 5 ? "五星" : (starNum === 4 ? "四星" : (starNum === 3 ? "三星" : (starNum === 2 ? "二星" : "一星")));
    
    return {
        name: charName,
        star: starNum,
        starName: starName,
        time: new Date().toLocaleTimeString()
    };
}

// 执行抽卡（1次或11次，每次独立计算）
function performPull(count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const card = pullOneCard();
        results.push(card);
        history.unshift(card);
        if (history.length > 50) history.pop();
    }
    
    displayResults(results);
    updateUI();
    saveData();
    
    // 五星闪光特效
    const hasFiveStar = results.some(c => c.star === 5);
    if (hasFiveStar) {
        const container = document.getElementById('resultArea');
        container.classList.add('flash-golden');
        setTimeout(() => container.classList.remove('flash-golden'), 600);
    }
}

// 显示抽卡结果
function displayResults(cards) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = '';
    
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        let rarityClass = '';
        if (card.star === 5) rarityClass = 'card-star5';
        else if (card.star === 4) rarityClass = 'card-star4';
        else if (card.star === 3) rarityClass = 'card-star3';
        else if (card.star === 2) rarityClass = 'card-star2';
        else rarityClass = 'card-star1';
        cardDiv.className = `card ${rarityClass}`;
        
        let imgPath = `P/${card.name}.png`;
        let starDisplay = '★'.repeat(card.star);
        
        cardDiv.innerHTML = `
            <img class="card-img" src="${imgPath}" alt="${card.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%23333355\'/%3E%3Ctext x=\'40\' y=\'45\' text-anchor=\'middle\' fill=\'%23aaa\' font-size=\'12\'%3E%3C/text%3E%3C/svg%3E'">
            <div class="card-name">${card.name}</div>
            <div class="card-rarity">${starDisplay} ${card.starName}</div>
        `;
        resultArea.appendChild(cardDiv);
    });
    
    updateHistoryList();
}

// 更新历史记录
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">暂无记录</div>';
        return;
    }
    
    historyList.innerHTML = '';
    history.slice(0, 50).forEach(record => {
        const item = document.createElement('div');
        let starClass = '';
        if (record.star === 5) starClass = 'history-star5';
        else if (record.star === 4) starClass = 'history-star4';
        else if (record.star === 3) starClass = 'history-star3';
        else if (record.star === 2) starClass = 'history-star2';
        else starClass = 'history-star1';
        
        item.className = `history-item ${starClass}`;
        let starIcon = '★'.repeat(record.star);
        
        item.innerHTML = `
            <span>${starIcon} ${record.name} 【${record.starName}】</span>
            <span style="font-size: 0.7rem;">${record.time}</span>
        `;
        historyList.appendChild(item);
    });
}

// 更新UI
function updateUI() {
    document.getElementById('totalPulls').textContent = totalPulls;
    document.getElementById('pityCount').textContent = pityCount5;
    document.getElementById('star5Count').textContent = star5Count;
    document.getElementById('star4Count').textContent = star4Count;
    
    const pityElem = document.getElementById('pityCount');
    if (pityCount5 >= 300) {
        pityElem.style.color = '#ff6a3a';
        pityElem.style.textShadow = '0 0 5px #ff6a3a';
    } else {
        pityElem.style.color = '#fff';
        pityElem.style.textShadow = 'none';
    }
}

// 保存数据
function saveData() {
    localStorage.setItem('gachaData', JSON.stringify({
        totalPulls: totalPulls,
        pityCount5: pityCount5,
        pityCount4: pityCount4,
        star5Count: star5Count,
        star4Count: star4Count,
        history: history.slice(0, 100)
    }));
}

// 加载数据
function loadData() {
    const saved = localStorage.getItem('gachaData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            totalPulls = parsed.totalPulls || 0;
            pityCount5 = parsed.pityCount5 || 0;
            pityCount4 = parsed.pityCount4 || 0;
            star5Count = parsed.star5Count || 0;
            star4Count = parsed.star4Count || 0;
            history = parsed.history || [];
            updateUI();
            updateHistoryList();
        } catch(e) {}
    }
}

// 重置数据
function resetData() {
    if (confirm('确定要重置所有抽卡数据吗？这将清空你的记录！')) {
        totalPulls = 0;
        pityCount5 = 0;
        pityCount4 = 0;
        star5Count = 0;
        star4Count = 0;
        history = [];
        updateUI();
        updateHistoryList();
        document.getElementById('resultArea').innerHTML = '<div class="placeholder-text">数据已重置~</div>';
        saveData();
    }
}

// 单抽
function singlePull() {
    performPull(1);
}

// 十一连
function elevenPull() {
    performPull(11);
}

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    updateHistoryList();
    
    document.getElementById('singlePull').addEventListener('click', singlePull);
    document.getElementById('elevenPull').addEventListener('click', elevenPull);
    document.getElementById('resetBtn').addEventListener('click', resetData);
});