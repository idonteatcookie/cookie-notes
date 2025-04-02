#!/bin/bash

# 输出带颜色的信息
info() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

# 确保在主分支
if [[ $(git symbolic-ref --short HEAD) != "main" ]]; then
    error "请切换到 main 分支后再执行部署"
    exit 1
fi

# 清理缓存和构建文件
info "清理缓存和旧的构建文件..."
rm -rf node_modules/.cache out

# 构建项目
info "构建项目..."
npm run build
if [ $? -ne 0 ]; then
    error "构建失败"
    exit 1
fi

# 创建 .nojekyll 文件
touch out/.nojekyll

# 删除已存在的 gh-pages 分支
info "准备部署分支..."
git branch -D gh-pages 2>/dev/null || true

# 创建新的 gh-pages 分支
git checkout --orphan gh-pages

# 添加构建文件
info "添加构建文件..."
git --work-tree out add --all

# 提交更改
info "提交更改..."
git --work-tree out commit -m "Deploy to gh-pages"

# 推送到远程
info "推送到 GitHub Pages..."
git push origin HEAD:gh-pages --force

# 返回主分支
info "清理临时分支..."
git checkout -f main
git branch -D gh-pages

success "部署完成！"
success "请访问 https://idonteatcookie.github.io/cookie-notes 查看部署结果" 