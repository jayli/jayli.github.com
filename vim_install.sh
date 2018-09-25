#!/bin/sh

install() {
  if [ -d "$HOME/.vim" ]; then
    mv $HOME/.vim $HOME/.vim.`date +%Y%m%d%H%M%S`
  fi

  git clone git@github.com:jayli/vim.git ~/.vim

  if [ -f "$HOME/.vimrc" ]; then
    mv ~/.vimrc ~/.vimrc.`date +%Y%m%d%H%M%S`
  fi

  ln -s $HOME/.vim/_vimrc $HOME/.vimrc
  #cp ~/.vim/_vimrc ~/.vimrc

  cd $HOME/.vim
  git submodule init
  git submodule update

  #vim +BundleInstall! +qall! </dev/tty

  #(cd ~/.vim/bundle/YouCompleteMe; ./install.sh --clang-completer)
}

update() {
	(cd $HOME/.vim; git pull;)
	(cd $HOME/.vim; git submodule update --remote;)
	(cd $HOME/.vim; git submodule foreach git checkout master;)
  #vim +BundleClean +BundleInstall +qall! </dev/tty
}

for arg in "$@"
do
  case $arg in 
    install)
      install;
      break;
      ;;
    update)
      update;
      break;
      ;;
  esac
done

