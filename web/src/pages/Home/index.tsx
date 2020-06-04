import React from 'react'
import { FiLogIn } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import './styles.css'
import Logo from '../../assets/logo.svg'

const Home = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={Logo} alt="Ecoleta" />
        </header>

        <main>
          <h1>Seu marktetplace de coleta de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coloeta de forma eficiente.</p>
          <Link to="/create-point">
              <span>
              <FiLogIn/>
              </span>
              <strong>Cadastre um ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  )
}

export default Home