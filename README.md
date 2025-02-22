# jtoh.pro

Created by Jacob Humston

## Links
- https://jtoh.pro
- https://beta.jtoh.pro

## Setup Process
- **OS:** Debian (latest) - https://www.debian.org/
- **OS:** Windows (WSL) - https://learn.microsoft.com/en-us/windows/wsl/install
- **Host:** Linode - https://www.linode.com/

```bash
sudo apt update 

sudo apt install git unzip gh expect

sudo su 

curl -fsSL https://bun.sh/install | bash 

gh auth login 

gh auth setup-git 

git config --global user.email "name@example.com" 

git config --global user.name "name"

mkdir jtoh.pro && cd jtoh.pro

git clone https://github.com/jacobhumston/jtoh.pro.git .

bun install 

bun start 
```

