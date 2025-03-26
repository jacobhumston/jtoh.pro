# jtoh.pro

Created by Jacob Humston

## Links

- https://jtoh.pro
- https://beta.jtoh.pro

## Setup Process

- **OS:** Debian (latest) - https://www.debian.org/
- **OS:** Windows (WSL) - https://learn.microsoft.com/en-us/windows/wsl/install
- **Host:** Linode - https://www.linode.com/

Install software dependencies.

```bash
sudo apt update

sudo apt install git unzip gh expect

sudo su

curl -fsSL https://bun.sh/install | bash
```

Setup git, as well as authentication with GitHub.

```bash
gh auth login

gh auth setup-git

git config --global user.email "name@example.com"

git config --global user.name "name"
```

<details>
  <summary>If the gh package isn't found, click here for more info.</summary>

### Run the following...

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
```

</details>

<br>

Setup the git repository.

```bash
mkdir jtoh.pro && cd jtoh.pro

git clone https://github.com/jacobhumston/jtoh.pro.git .

bun install

# Get started with commands:
./x
```
