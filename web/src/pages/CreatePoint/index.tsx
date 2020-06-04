import React, { useEffect , useState, ChangeEvent, FormEvent} from 'react'
import { Link, useHistory} from 'react-router-dom' 
import { FiArrowDownLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api'
import axios from 'axios'

import './styles.css'
import Logo from '../../assets/logo.svg'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string
}

const CreatePoint = () => {

  const [itens, setItens] = useState<Item[]>([])
  const [uf, setUf] = useState<string[]>([])
  const [cities, setCity] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setselectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [initialPosition, setInicialPosition] = useState<[number, number]>([0,0])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
  const [selectedItens, setSelectedItens] = useState<number[]>([])

  const history = useHistory();

  useEffect( () => {
    api.get('itens').then( response => {
      setItens(response.data)
    })
  }, [] )

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)
        setUf(ufInitials)
      })
  }, [])

  useEffect(() => {
    if(selectedUf === '0') return;

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome)
        setCity(cityNames)
      })

  }, [selectedUf])

  useEffect( () => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude } = position.coords

      setInicialPosition([latitude, longitude])
    })
  }, [])

  function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setselectedUf(uf)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city)
  }

  function handleMapClick(event:LeafletMouseEvent){
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }

  async function handleSubmit(event:FormEvent){

    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const itens = selectedItens;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      itens
    }

    await api.post('points', data);
    alert('Ponto de Coleta Criado.')

    history.push('/')
      
  }

  function handleSelectItem(id:number){
    const alreadySelected = selectedItens.findIndex(item => item === id);

    if (alreadySelected >= 0){

      const filteredItens = selectedItens.filter(item => item !== id)

      setSelectedItens(filteredItens)

    } else {
      
      setSelectedItens([...selectedItens, id])

    }

  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>){
    const {name, value } = event.target

    setFormData({...formData, [name] : value})
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowDownLeft />
        Voltar para a home
      </Link>

      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text" 
              name="name" 
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>
          
          <div className="field-group">

            <div className="field">
              <label htmlFor="uf">Estado(UF)</label> 
              <select 
                name="uf" 
                id="uf" 
                value={selectedUf} 
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {uf.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

          </div>

          
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo.</span>
          </legend>

          <ul className="items-grid">

            {itens.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItens.includes(item.id) ? 'selected': ''}>
                <img src={item.image_url} alt="teste"/>
                <span>{item.title}</span>
              </li>
            ))}

          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );

}

export default CreatePoint;