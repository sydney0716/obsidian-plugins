# Custom Folder Index for Obsidian

This plugin for [Obsidian](https://obsidian.md) allows you to automatically generate and maintain index notes for your folders. It keeps track of files and subfolders, ensuring your folder notes are always up-to-date.

# Features

- **Automatic Indexing**: Generates an index file containing links to all files and subfolders within a directory.
- **Recursive Support**: Can generate indexes for a folder and all its subfolders in one go.
- **Auto-Update**: Automatically updates index files when you create, rename, or delete files in a folder (if enabled).
- **Customizable Templates**: Define exactly how your index note should look using placeholders like `{folderName}`, `{files}`, and `{subfolders}`.
- **Blacklist System**: Exclude specific folders or entire subtrees from being indexed via the context menu or settings.

# How to Use

### Creating an Index
1. Right-click on any folder in your file explorer.
2. Select **Create folder index (Recursive)** to generate indexes for that folder and all subfolders.
3. Alternatively, use the command palette (`Cmd/Ctrl + P`) and search for "Create folder index".

### Managing Updates
- **Auto-Update**: By default, the plugin will watch for changes and update your index files automatically.
- **Stop Indexing**: Right-click a folder and select **Stop Indexing (Blacklist)** to prevent the plugin from touching that folder. You can resume it anytime by selecting **Resume Indexing**.

# Settings

- **Index Filename**: Define the naming convention for your index files (e.g., `0_{folderName}`).
- **Template**: Customize the content of the index file.
  - `{folderName}`: The name of the current folder.
  - `{files}`: A list of links to files in the folder.
  - `{subfolders}`: A list of links to subfolders.
- **Blacklist**: Manually manage the list of excluded paths.

# Installation

Since this plugin is currently a personal project:
1. Copy the `custom-folder-index` folder to your vault's `.obsidian/plugins/` directory.
2. Reload Obsidian.
3. Enable "Custom Folder Index" in Community Plugins.

---

# Obsidian용 Custom Folder Index

이 [Obsidian](https://obsidian.md) 플러그인은 폴더에 대한 인덱스 노트를 자동으로 생성하고 관리해줍니다. 파일과 하위 폴더를 추적하여 폴더 노트가 항상 최신 상태를 유지하도록 돕습니다.

# 주요 기능

- **자동 인덱싱 (Automatic Indexing)**: 폴더 내의 모든 파일과 하위 폴더 링크가 포함된 인덱스 파일을 생성합니다.
- **재귀적 지원 (Recursive Support)**: 특정 폴더와 그 아래 모든 하위 폴더에 대해 한 번에 인덱스를 생성할 수 있습니다.
- **자동 업데이트 (Auto-Update)**: 폴더 내에서 파일을 생성, 이름 변경, 또는 삭제할 때 인덱스 내용을 자동으로 업데이트합니다 (설정에서 활성화 필요). 
- **커스텀 템플릿 (Customizable Templates)**: `{folderName}`, `{files}`, `{subfolders}`와 같은 변수를 사용하여 인덱스 노트의 형식을 원하는 대로 지정할 수 있습니다.
- **블랙리스트 시스템 (Blacklist System)**: 특정 폴더나 하위 트리를 인덱싱에서 제외하도록 설정할 수 있습니다 (우클릭 메뉴 또는 설정 사용).

# 사용 방법

### 인덱스 생성
1. 파일 탐색기에서 원하는 폴더를 우클릭합니다.
2. **Create folder index (Recursive)**를 선택하여 해당 폴더와 하위 폴더들의 인덱스를 생성합니다.
3. 또는 명령어 팔레트(`Cmd/Ctrl + P`)에서 "Create folder index"를 검색하여 실행할 수 있습니다.

### 업데이트 관리
- **자동 업데이트**: 기본적으로 플러그인은 변경 사항을 감지하여 인덱스 파일을 자동으로 업데이트합니다.
- **인덱싱 중지**: 폴더를 우클릭하고 **Stop Indexing (Blacklist)**을 선택하면 해당 폴더는 더 이상 자동으로 업데이트되지 않습니다. **Resume Indexing**을 선택하여 다시 활성화할 수 있습니다.

# 설정 (Settings)

- **Index Filename**: 인덱스 파일의 이름 규칙을 지정합니다 (예: `0_{folderName}`).
- **Template**: 인덱스 파일의 내용을 커스터마이징합니다.
  - `{folderName}`: 현재 폴더의 이름
  - `{files}`: 폴더 내 파일들의 링크 목록
  - `{subfolders}`: 하위 폴더들의 링크 목록
- **Blacklist**: 제외된 경로 목록을 수동으로 관리할 수 있습니다.

# 설치 방법

현재 개인 프로젝트로 진행 중이므로 수동 설치가 필요할 수 있습니다:
1. `custom-folder-index` 폴더를 보관함(Vault)의 `.obsidian/plugins/` 경로에 복사합니다.
2. Obsidian을 다시 로드(Reload) 합니다.
3. **Community Plugins** 설정에서 "Custom Folder Index"를 활성화합니다.
