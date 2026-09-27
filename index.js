// RPG 场景地图 - 安全版
(function() {
    'use strict';
    
    let currentScene = null;
    let viewMode = '2d';
    
    // 注入样式
    function injectStyle() {
        const style = document.createElement('style');
        style.textContent = `
            #rpg-map-panel {
                position: fixed;
                right: 16px;
                top: 100px;
                width: 320px;
                background: rgba(15, 15, 25, 0.95);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                padding: 12px;
                z-index: 9998;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                font-family: "Microsoft YaHei", sans-serif;
                color: #fff;
            }
            .map-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .map-title { color: #ffd700; font-size: 14px; font-weight: bold; }
            #rpg-map-canvas { width: 100%; border-radius: 8px; }
            .map-header button {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                color: #fff;
                padding: 4px 8px;
                font-size: 11px;
                cursor: pointer;
                margin-left: 6px;
            }
            @media (max-width: 768px) {
                #rpg-map-panel { width: 85vw; right: 7.5vw; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 渲染地图
    function renderMap() {
        try {
            const canvas = document.getElementById('rpg-map-canvas');
            if (!canvas || !currentScene) return;
            
            const ctx = canvas.getContext('2d');
            const W = canvas.width = 300;
            const H = canvas.height = 220;
            
            ctx.clearRect(0, 0, W, H);
            
            // 背景
            ctx.fillStyle = currentScene.mode === 'room' ? '#2a2520' : '#1a2a1a';
            ctx.fillRect(0, 0, W, H);
            
            // 渲染对象
            (currentScene.objects || []).forEach(obj => {
                const x = (obj.x / 100) * W;
                const y = (obj.y / 100) * H;
                
                if (obj.type === 'wall') {
                    ctx.fillStyle = '#5a4a3a';
                    ctx.fillRect(x, y, (obj.w/100)*W, (obj.h/100)*H);
                } else if (obj.type === 'furniture') {
                    ctx.fillStyle = '#8b6914';
                    ctx.fillRect(x-12, y-12, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px sans-serif';
                    ctx.fillText(obj.icon || '📦', x-6, y+4);
                } else if (obj.type === 'npc') {
                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI * 2);
                    ctx.fillStyle = '#4a9eff';
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px sans-serif';
                    ctx.fillText(obj.icon || '👤', x-6, y+4);
                } else if (obj.type === 'player') {
                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI * 2);
                    ctx.fillStyle = '#4caf50';
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px sans-serif';
                    ctx.fillText(obj.icon || '🧍', x-6, y+4);
                }
            });
            
            // 标题
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.fillText(currentScene.name || '场景', 10, 20);
        } catch(e) {
            console.error('Render error:', e);
        }
    }
    
    // 从消息提取场景
    function extractScene(text) {
        try {
            const match = text.match(/\[SCENE\]([\s\S]*?)\[\/SCENE\]/);
            if (match) {
                currentScene = JSON.parse(match[1]);
                renderMap();
            }
        } catch(e) {
            console.error('Parse error:', e);
        }
    }
    
    // 监听新消息
    function watchMessages() {
        // 用 MutationObserver 监听聊天区域变化
        const chat = document.getElementById('chat');
        if (!chat) {
            setTimeout(watchMessages, 1000);
            return;
        }
        
        const observer = new MutationObserver(() => {
            // 检查最后一条消息
            const lastMsg = chat.querySelector('.last_mes, .mes:last-child');
            if (lastMsg) {
                extractScene(lastMsg.textContent);
            }
        });
        
        observer.observe(chat, { childList: true, subtree: true });
    }
    
    // 初始化
    function init() {
        try {
            injectStyle();
            
            // 创建面板
            const panel = document.createElement('div');
            panel.id = 'rpg-map-panel';
            panel.innerHTML = `
                <div class="map-header">
                    <span class="map-title">🗺️ 场景地图</span>
                    <div>
                        <button onclick="window.__rpgToggleView()">切3D</button>
                        <button onclick="document.getElementById('rpg-map-panel').style.display='none'">×</button>
                    </div>
                </div>
                <canvas id="rpg-map-canvas"></canvas>
            `;
            document.body.appendChild(panel);
            
            // 切换视角函数
            window.__rpgToggleView = function() {
                viewMode = viewMode === '2d' ? '3d' : '2d';
                renderMap();
            };
            
            watchMessages();
            console.log('RPG Map loaded safely!');
        } catch(e) {
            console.error('Init error:', e);
        }
    }
    
    // 等页面加载完
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
